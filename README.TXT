# Pinterest Pin Collector

A lightweight, powerful tool for automating data collection from Pinterest. This script allows you to extract information about pins (URL, image, and like count) directly from the browser interface without manual navigation, storing your data persistently across sessions.

## Key Features

* **One-Click Collection:** Rapidly parse pin data from the current page masonry layout.
* **Persistent Sessions:** Data is automatically saved to the browser's `localStorage`, ensuring no loss of progress upon page refresh.
* **Analytics:** Includes an automated "Top-N" report that highlights the most popular pins in your current session based on likes.
* **Flexible Export:** Easily copy your results as **JSON** to your clipboard or download a formatted **CSV** file for spreadsheet analysis.
* **Optimized UI:** A dedicated control panel designed for accessibility, fully compatible with browser zooming/scaling.

## Installation & Usage

1. Open your browser's Developer Tools (usually **F12** or **Right-click > Inspect**).
2. Go to the **Console** tab.
3. Paste the script code and press **Enter**.
4. A control panel will appear in the bottom-right corner of your screen. Click **"Open panel"** to begin.

## Control Panel Guide

* **Collect:** Scans the page and adds new pins to your database.
* **Top-N:** Displays the top pins by like count (auto-triggers every N pins collected).
* **Clear All:** Resets your session and wipes the cached data from your browser.
* **Copy JSON / Export CSV:** Tools to move your data into external analysis software.

## Technical Details

* **Language:** Vanilla JavaScript (zero dependencies).
* **Storage:** Uses `localStorage` to maintain state across page navigations.
* **Parsing:** Leverages `DOMParser` for efficient HTML analysis.

---
*Disclaimer: This tool is intended for personal use and automating the collection of publicly available data. Please adhere to Pinterest's Terms of Service.*