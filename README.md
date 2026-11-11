# DuelingBook Custom Sleeves

Give yourself and your opponent **different card sleeves** on DuelingBook. Each card keeps the sleeve of the player who owns it, even if the card is stolen or moved (for example by Thousand Eyes Restrict).

- Pick your own sleeve for your cards and a different one for your opponent's cards.
- Paste an image link or upload a picture from your computer.
- Turn it on or off with one click.
- Works alongside other addons such as DuelingBook Enhancer.

**Important:** only you see these sleeves. Your opponent still sees the normal game sleeves, and you see their custom sleeve only because the script is running in your browser.

---

## How to install (about 2 minutes)

You need a free browser extension called **Tampermonkey**. It runs small scripts like this one.

### Step 1: Install Tampermonkey

Go to [tampermonkey.net](https://www.tampermonkey.net/) and add it to your browser (Chrome, Edge, Firefox and others are supported).

### Step 2: Install the script

Click this link:

**[Install DuelingBook Custom Sleeves](https://raw.githubusercontent.com/izucem/db-custom-sleeves/main/duelingbook-sleeves.user.js)**

Tampermonkey will open an install page. Click the **Install** button.

> If nothing happens when you click the link, make sure Tampermonkey is installed and turned on, then try again.

### Step 3: Refresh DuelingBook

Reload the DuelingBook page. You should see a small **Sleeves** button in the **top-right corner** of the page.

---

## How to use it

Click the **Sleeves** button to open the settings panel.

| What you want | What to do |
| --- | --- |
| Use a sleeve from the internet | Paste the image link into the box for "You" or "Opponent" and press **Enter**. The link must start with `https://`. |
| Use a picture from your computer | Click **Upload...** and choose an image file. |
| Go back to the default sleeve | Click **Reset to default**. |
| Turn everything off or on | Tick or untick **Enabled**, or **hold Shift and click** the Sleeves button for a quick toggle. |

Notes:

- **"You (bottom)"** is the sleeve for your cards. **"Opponent (top)"** is the sleeve for your opponent's cards.
- Your choices are saved in your browser, so they are still there next time.
- Uploaded pictures are automatically cropped to card shape (from the center) and shrunk so they are small enough to save.
- Square pictures, such as card art, work but will be cropped on the sides. Dragging the picture to choose which part is shown is not available yet.
- Some websites block their images from being used on other sites. If a pasted link shows nothing, download the image and use **Upload...** instead.
- When you are *watching* a duel instead of playing, "You" means whichever player is shown at the bottom.

---

## Troubleshooting

**I don't see the Sleeves button.**
Check that Tampermonkey is turned on and that the script is switched on in the Tampermonkey menu, then refresh the page with Ctrl+F5 (Cmd+Shift+R on Mac).

**Both players have the same sleeve.**
Make sure you do not have another sleeve-changing script or addon running at the same time, such as the sleeve changer in DuelingBook Custom Layout. Turn its sleeve option off, because two sleeve changers will fight over the same cards.

**The button is in the way of something.**
Please report it (see below) and tell us what it is covering.

**It stopped working after a DuelingBook update.**
The script depends on how DuelingBook is built, so a site update can break it. Please report it with the details below.

---

## Reporting a problem

Open an **Issue** on this page and describe what happened. If you are comfortable with it, include some debug info:

1. Start or watch a duel.
2. Press **F12**, open the **Console** tab, and type: `copy(sleeveDebug())` then press Enter.
3. Paste the result into your report.

---

## Credits and license

Written by Claude (an AI model made by Anthropic), with testing and direction from the project owner.

Free to use and share.
