import os
import discord
from discord.ext import commands
from collections import defaultdict
import datetime

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

message_tracking = defaultdict(list)
SPAM_THRESHOLD = 5
TIME_WINDOW = 5.0
TIMEOUT_DURATION = 60

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user.name} (ID: {bot.user.id})")
    print("Anti-spam protection is active on Railway!")

@bot.event
async def on_message(message):
    if message.author.bot or not message.guild:
        return

    author = message.author

    # Bypass server owners and administrators
    if author == message.guild.owner or author.guild_permissions.administrator:
        await bot.process_commands(message)
        return

    current_time = datetime.datetime.now().timestamp()
    timestamps = message_tracking[author.id]
    timestamps = [t for t in timestamps if current_time - t < TIME_WINDOW]
    timestamps.append(current_time)
    message_tracking[author.id] = timestamps

    if len(timestamps) > SPAM_THRESHOLD:
        try:
            timeout_until = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=TIMEOUT_DURATION)
            await author.timeout(timeout_until, reason="Automatic timeout: Spamming messages.")
            
            warning_msg = await message.channel.send(
                f"⚠️ {author.mention} has been timed out for {TIMEOUT_DURATION} seconds for spamming."
            )
            message_tracking[author.id].clear()
            await warning_msg.delete(delay=5)
            
        except Exception as e:
            print(f"Failed to timeout {author.name}: {e}")

    await bot.process_commands(message)

# Grab token from Railway's environment variables safely
TOKEN = os.getenv("DISCORD_TOKEN")
if not TOKEN:
    print("Error: DISCORD_TOKEN environment variable not set!")
else:
    bot.run(TOKEN)
      
