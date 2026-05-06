const transactionForm = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");
const totalWealthElement = document.getElementById("total-wealth");
const budgetGoalElement = document.getElementById("budget-goal");
const remainingMoneyElement = document.getElementById("remaining-money");
const searchInput = document.getElementById("search");
const exportBtn = document.getElementById("export-btn");
const themeToggle = document.getElementById("theme-toggle");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let expenseChart = null;
let trendChart = null;

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-theme");
  themeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
}

function isLight() {
  return document.body.classList.contains("light-theme");
}

function chartColors() {
  return isLight()
    ? {
        green: "#3a8f55",
        lime: "#6a9940",
        beige: "#b07830",
        teal: "#2e7a6a",
        olive: "#7a8f30",
        sand: "#c09050",
        muted: "#7a8f7d",
        grid: "#d8ceba",
        text: "#2a3a2c",
      }
    : {
        green: "#5db87a",
        lime: "#8dbf6a",
        beige: "#d4a96a",
        teal: "#5aaa90",
        olive: "#a0b855",
        sand: "#c49558",
        muted: "#7a8f7d",
        grid: "#1e2e21",
        text: "#e8e0d0",
      };
}

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-EN", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function updateStats() {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const remaining = totalIncome - totalExpense;

  totalWealthElement.textContent = formatCurrency(totalIncome);
  budgetGoalElement.textContent = formatCurrency(totalExpense);
  remainingMoneyElement.textContent = formatCurrency(remaining);

  const c = chartColors();
  remainingMoneyElement.style.color = remaining >= 0 ? c.green : c.beige;
}

function renderTable(filter = "") {
  transactionList.innerHTML = "";

  const filtered = transactions.filter(
    (t) =>
      t.category.toLowerCase().includes(filter.toLowerCase()) ||
      t.date.includes(filter) ||
      (t.description &&
        t.description.toLowerCase().includes(filter.toLowerCase())),
  );

  if (filtered.length === 0) {
    transactionList.innerHTML = `
            <tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 30px;">
                No transactions yet.
            </td></tr>`;
    return;
  }

  filtered.forEach((t) => {
    const row = document.createElement("tr");
    const isIncome = t.type === "income";
    const c = chartColors();
    row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.category}</td>
            <td>${t.description || "-"}</td>
            <td style="color: ${isIncome ? c.green : c.beige}; font-weight: 700;">
                ${isIncome ? "+" : "-"} ${formatCurrency(t.amount)}
            </td>
            <td>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>`;
    transactionList.appendChild(row);
  });
}

function renderExpenseChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  const c = chartColors();

  const expenses = transactions.filter((t) => t.type === "expense");
  const categories = {};
  expenses.forEach((t) => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels.length > 0 ? labels : ["No Data"],
      datasets: [
        {
          data: data.length > 0 ? data : [1],
          backgroundColor: [c.green, c.beige, c.lime, c.teal, c.olive, c.sand],
          borderWidth: 2,
          borderColor: isLight() ? "#faf6ee" : "#151c16",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      layout: { padding: 8 },
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: c.muted, padding: 12, font: { size: 12 } },
        },
      },
      cutout: "62%",
    },
  });
}

function renderTrendChart() {
  const ctx = document.getElementById("trendChart").getContext("2d");
  const c = chartColors();

  const months = [],
    incomeData = [],
    expenseData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-EN", {
      month: "short",
      year: "2-digit",
    });
    months.push(label);
    incomeData.push(
      transactions
        .filter((t) => t.type === "income" && t.date.startsWith(key))
        .reduce((s, t) => s + t.amount, 0),
    );
    expenseData.push(
      transactions
        .filter((t) => t.type === "expense" && t.date.startsWith(key))
        .reduce((s, t) => s + t.amount, 0),
    );
  }

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          borderColor: c.green,
          backgroundColor: isLight()
            ? "rgba(58,143,85,0.08)"
            : "rgba(93,184,122,0.08)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: c.green,
          pointRadius: 4,
        },
        {
          label: "Expenses",
          data: expenseData,
          borderColor: c.beige,
          backgroundColor: isLight()
            ? "rgba(176,120,48,0.08)"
            : "rgba(212,169,106,0.08)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: c.beige,
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { labels: { color: c.muted } } },
      scales: {
        x: { ticks: { color: c.muted }, grid: { color: c.grid } },
        y: { ticks: { color: c.muted }, grid: { color: c.grid } },
      },
    },
  });
}

function updateInsights() {
  const insightContent = document.getElementById("insight-content");
  if (transactions.length === 0) {
    insightContent.innerHTML = "<p>Use the form to submit a request.</p>";
    return;
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const savingsRate =
    totalIncome > 0
      ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
      : 0;

  const categories = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

  insightContent.innerHTML = `
        <p>💰 <strong>Savings Rate:</strong> %${savingsRate}</p>
        ${topCategory ? `<p>📊 <strong>Highest Expense:</strong> ${topCategory[0]} (${formatCurrency(topCategory[1])})</p>` : ""}
        <p>${savingsRate >= 20 ? "✅ Great! Your savings rate looks healthy." : "⚠️ Try to increase your savings rate."}</p>
    `;
}

function refreshUI() {
  updateStats();
  renderTable(searchInput.value);
  renderExpenseChart();
  renderTrendChart();
  updateInsights();
}

function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this entry?")) return;
  transactions = transactions.filter((t) => t.id !== id);
  updateLocalStorage();
  refreshUI();
}

exportBtn.addEventListener("click", () => {
  if (transactions.length === 0) {
    alert("There are no records to export.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const remaining = totalIncome - totalExpense;
  const today = new Date().toLocaleDateString("tr-TR");

  doc.setFontSize(20);
  doc.setTextColor(40, 80, 50);
  doc.text("WealthWise", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(120, 140, 125);
  doc.text(`Rapor Tarihi: ${today}`, 14, 28);

  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text(`Total revenue : ${formatCurrency(totalIncome)}`, 14, 42);
  doc.text(`Toplam expenses : ${formatCurrency(totalExpense)}`, 14, 50);
  doc.text(`Net Balance   : ${formatCurrency(remaining)}`, 14, 58);

  doc.setDrawColor(200, 210, 200);
  doc.line(14, 63, 196, 63);

  const tableRows = transactions.map((t) => [
    t.date,
    t.type === "income" ? "Income" : "Expenses",
    t.category,
    t.description || "-",
    formatCurrency(t.amount),
  ]);

  doc.autoTable({
    startY: 68,
    head: [["Date", "Type", "Category", "Description", "Amount"]],
    body: tableRows,
    headStyles: {
      fillColor: [58, 143, 85],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 250, 246],
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [40, 40, 40],
    },
    columnStyles: {
      4: { halign: "right" },
    },
  });

  doc.save("wealthwise_rapor.pdf");
});

transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;
  const description = document.getElementById("description").value;

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  transactions.push({
    id: Date.now(),
    amount,
    category,
    date,
    type,
    description,
  });
  updateLocalStorage();
  transactionForm.reset();
  refreshUI();
});

searchInput.addEventListener("input", () => renderTable(searchInput.value));

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  const icon = themeToggle.querySelector("i");
  icon.classList.toggle("fa-moon");
  icon.classList.toggle("fa-sun");
  localStorage.setItem("theme", isLight() ? "light" : "dark");
  refreshUI();
});

window.addEventListener("DOMContentLoaded", refreshUI);
