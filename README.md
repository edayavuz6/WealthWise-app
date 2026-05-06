# 💰 WealthWise — Personal Finance Tracker

WealthWise is a clean and easy-to-use web application for tracking your income and expenses. No installation required — runs directly in the browser.

LİVE CODE - 
---

## ✨ Features

- ➕ Add income and expense records
- 🗂️ Category-based classification (Salary, Housing, Food, Transport, etc.)
- 📊 Doughnut chart for expense distribution
- 📈 6-month income/expense trend chart
- 💡 Automatic savings rate analysis
- 🔍 Transaction search
- 🗑️ Delete records
- 📄 Export data as a formatted PDF report
- 🌙 Dark / ☀️ Light theme toggle
- 💾 Data is stored locally in the browser (LocalStorage) — no account or server needed

---

## 📄 PDF Export

Clicking the **Export** button generates a PDF report containing:
- Report date
- Summary of total income, total expenses, and net balance
- Full transaction table (date, type, category, description, amount)

---

## 📁 File Structure

```
wealthwise/
├── index.html   # Main page and HTML structure
├── app.css      # Styles and theme variables
└── style.js     # App logic (data, charts, calculations)
```

---

## 🛠️ Built With

| Technology | Description |
|------------|-------------|
| HTML5 | Page structure |
| CSS3 | Styling and theme system |
| JavaScript (Vanilla) | Application logic |
| [Chart.js](https://www.chartjs.org/) | Chart library |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF generation |
| [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | PDF table plugin |
| [Font Awesome](https://fontawesome.com/) | Icons |
| LocalStorage API | Data persistence |

---

## 📌 Notes

- All data is stored only in the user's browser and is never sent to any server.
- Clearing browser cache will erase saved data — regular PDF exports are recommended as backup.

---

## 🙋 Developer

This project was built as part of a JavaScript learning journey. Contributions and suggestions are always welcome!
