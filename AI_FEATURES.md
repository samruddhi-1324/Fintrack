# FinTrack — Implemented AI Features & Intelligence Suite

**Project Owner / Lead Developer:** Samruddhi  
**Last Updated:** September 4, 2026  
**Module Status:** 100% Production Ready & Tested  

FinTrack includes a comprehensive, multi-provider AI Intelligence suite that transforms personal finance management from passive record-keeping into proactive, automated, and predictive financial control.

---

## 🏗️ 1. Multi-Provider AI Architecture

FinTrack uses an abstract, pluggable provider pattern ([`BaseAIProvider`](file:///d:/Fintrack/backend/app/services/ai/base.py)) orchestrating real PostgreSQL database transaction data with AI models.

| Provider | Model / Implementation | Description & Use Case |
|---|---|---|
| **Google Gemini** *(Default)* | `gemini-1.5-flash` | High-speed multi-modal vision OCR, NLP parsing, and sentiment generation via Google Generative AI SDK. |
| **OpenAI ChatGPT** | `gpt-4o-mini` | Async OpenAI vision and chat completions provider for structured financial data JSON responses. |
| **Rule-Based Engine** | `RuleBasedProvider` | 100% offline, zero-key, deterministic statistical fallback for categorization, sentiment, and regex text extraction. |

* **Environment Controlled**: Easily switch active providers by setting `AI_PROVIDER=gemini | openai | rule_based` in `backend/.env`.

---

## 📷 2. Smart AI Vision OCR Receipt Scanner

* **API Endpoint**: `POST /api/v1/ai/scan-receipt`
* **Supported Formats**: JPEG, PNG, WEBP (Max 10 MB)
* **Frontend Component**: [`ReceiptScannerModal.tsx`](file:///d:/Fintrack/frontend/src/components/ai/ReceiptScannerModal.tsx)

### Capabilities:
* **Multi-Modal Image Vision Parsing**: Upload or drag-and-drop any receipt/invoice photo.
* **Automated Extraction**:
  * Merchant / Store Name
  * Total Bill Amount (₹) with multi-format cleaning (`₹1,450.00`, `1,450`, `450/-`)
  * Transaction Date (`YYYY-MM-DD`)
  * Payment Mode (`cash`, `card`, `upi`)
  * Category Matching (auto-selects from user's authentic PostgreSQL database categories)
  * Line Items breakdown table (individual item names and prices)
  * Confidence Score badge
* **Interactive UI & 1-Click Form Filling**:
  * Glassmorphism thumbnail preview with animated scanning indicator.
  * Direct inline editing for Merchant and Total Amount inputs inside the modal.
  * 1-Click **"Fill Form"** to populate the main Expense modal, or **"Log Expense Immediately"**.

---

## 🏆 3. 0–100 AI Financial Health Score

* **API Endpoint**: `GET /api/v1/ai/health-score`
* **Frontend Component**: [`FinancialHealthScoreWidget.tsx`](file:///d:/Fintrack/frontend/src/components/ai/FinancialHealthScoreWidget.tsx)

Audits 100% authentic transaction records across **4 Core Financial Pillars**:

1. **Budget Adherence (30 Pts)**: Evaluates monthly budget utilization. Spending $\le 80\%$ earns maximum points.
2. **Daily Burn Velocity (25 Pts)**: Compares daily burn rate against expected daily budget pace.
3. **Category Concentration Risk (25 Pts)**: Audits category diversification. Penalizes single categories absorbing $>60\%$ of total spend.
4. **Month-over-Month Savings Progression (20 Pts)**: Rewards MoM spend reductions and baseline consistency.

### Outputs:
* **Circular Score Gauge**: Displays overall score (0–100).
* **Letter Grades & Tier Titles**:
  * `85 - 100`: **Grade A+** — 🏆 Financial Master
  * `70 - 84`: **Grade A** — 🌱 Disciplined Spender
  * `55 - 69`: **Grade B** — ⚖️ Moderate Health
  * `40 - 54`: **Grade C** — ⚠️ Needs Optimization
  * `0 - 39`: **Grade D** — 🚨 Budget at Risk
* **Pillar Breakdown**: Individual progress bars, score badges, status emojis, and specific feedback for each pillar.
* **Actionable Recommendations**: Step-by-step guidance to improve the score.

---

## 🔮 4. AI Predictive Expense Forecasting & Burn Analytics

* **API Endpoint**: `GET /api/v1/ai/forecast`
* **Frontend Component**: [`AIForecastWidget.tsx`](file:///d:/Fintrack/frontend/src/components/ai/AIForecastWidget.tsx)

### Analytics Computed:
* **Daily Burn Rate**: Real-time spending pace ($\text{Current Spend} / \text{Days Elapsed}$).
* **Month-End Projected Spend**: $\text{Current Spend} + (\text{Daily Burn Rate} \times \text{Days Remaining})$.
* **Projected Variance**: Surplus or deficit calculation against total monthly budget limit.
* **Recommended Safe Daily Spend Allowance**: Maximum daily spending cap allowed for remaining days to stay within budget.
* **Predicted Budget Exhaustion Day**: Calculates the exact calendar day when budget cap will be depleted if current burn rate continues.
* **Category-Level Run Rates**: Category status indicators (`on_track` 🌱, `near_limit` ⚠️, `over_budget` 🚨).
* **Forecast Status & Emoji Narrative**: Dynamic narrative headlines and tactical advice.

---

## 🎭 5. AI Financial Mood & Emotional Sentiment Analysis

Integrated into the Dashboard ([`AIInsightsWidget.tsx`](file:///d:/Fintrack/frontend/src/components/ai/AIInsightsWidget.tsx)) to give immediate visual and emotional feedback on spending health:

| Mood State | Emoji Badge | Utilization / Condition | Headline & Narrative |
|---|---|---|---|
| **Distressed** | 😱 🚨 💸 | $>120\%$ Budget Overrun | *Budget Overrun Critical! Spending freeze advised.* |
| **Over Limit** | 💸 💔 ⚠️ | $100\% - 120\%$ Spent | *Monthly Budget Exceeded. Trim discretionary spends.* |
| **Cautious** | 😬 ⚠️ ⏳ | $80\% - 100\%$ Spent | *Approaching Budget Limit. Buffer running low.* |
| **Thriving** | 🥳 💰 🎯 | $<80\%$ Spent | *Healthy & Disciplined Spending. On track!* |
| **Zen** | 🧘 ✨ 💚 | $0\%$ Spend / Baseline | *Clean Financial Slate. Ready for disciplined budgeting.* |

---

## 📊 6. Spending Insights & Overspending Alerts

* **API Endpoint**: `GET /api/v1/ai/insights`
* **Frontend Component**: [`AIInsightsWidget.tsx`](file:///d:/Fintrack/frontend/src/components/ai/AIInsightsWidget.tsx)

### Capabilities:
* **Real PostgreSQL Aggregations**: Calculates current month total, previous month total, category sums, and budget utilization with zero PII sent to AI APIs.
* **Smart Insight Cards**: Severity-coded cards (`info`, `warning`, `danger`, `success`) highlighting spending surges, category spikes, and savings wins.
* **Category Concentration Alerts**: Pinpoints high-spend categories absorbing $>40\%$ of monthly outflow.

---

## 🎯 7. Dynamic Category Budget Recommendations

* **Rendered On**: Budgets Page ([`frontend/src/app/budgets/page.tsx`](file:///d:/Fintrack/frontend/src/app/budgets/page.tsx))

### Capabilities:
* **Real-Spend Buffers**: Calculates a 15% safety buffer above actual category spend.
* **1-Click `Apply Target →` Integration**: Clicking the recommendation pre-selects the category UUID and populates the budget goal modal automatically.

---

## ✨ 8. Smart Auto-Categorization

* **API Endpoint**: `POST /api/v1/ai/categorize`
* **Frontend Component**: [`ExpenseFormModal.tsx`](file:///d:/Fintrack/frontend/src/components/expenses/ExpenseFormModal.tsx)

### Capabilities:
* **Merchant & Title Analysis**: Predicts the best matching category for any merchant (e.g. *"Starbucks"* $\rightarrow$ *Food*, *"Uber"* $\rightarrow$ *Transport*).
* **"✨ AI Suggest" Chip**: Interactive chip above the category select dropdown in the Expense modal that auto-selects the predicted category in 1 click.

---

## 🪄 9. Natural Language Quick-Add (NLP)

* **API Endpoint**: `POST /api/v1/ai/parse-expense`
* **Frontend Component**: [`ExpenseFormModal.tsx`](file:///d:/Fintrack/frontend/src/components/expenses/ExpenseFormModal.tsx)

### Capabilities:
* **Single-Sentence Sentence Parser**: Converts conversational inputs (e.g. *"Paid 1200 for groceries with card"*) into structured fields:
  * **Title**: *"Groceries"*
  * **Amount**: `1200.00`
  * **Payment Mode**: `"card"`
  * **Category**: Matched Category UUID
* **"Fill" Button**: Instantly auto-fills form inputs without manual typing.

---

## 🤖 10. AI Financial Copilot & Conversational Assistant

* **API Endpoint**: `POST /api/v1/ai/copilot`
* **Frontend Component**: [`AICopilotDrawer.tsx`](file:///d:/Fintrack/frontend/src/components/ai/AICopilotDrawer.tsx)
* **Global Access**: Mounted in [`RootLayout`](file:///d:/Fintrack/frontend/src/app/layout.tsx) for instant access across all app pages.

### Capabilities:
* **24/7 Conversational Financial Q&A**: Ask any question about personal spending, daily burn pace, budget status, or category totals.
* **Context-Aware Analytics**: Evaluates authentic user metrics from PostgreSQL (current month spend, category totals, active budgets, daily burn rate, health score, top transactions).
* **Levitating Glassmorphic Drawer**: Floating trigger button (`🤖 AI Copilot`) opening a slide-over chat drawer with markdown bubble rendering, interactive quick prompt suggestion chips, and typing indicators.

---

## 🚨 11. AI Anomaly & Subscription Price-Hike Detector

* **API Endpoint**: `GET /api/v1/ai/anomalies`
* **Frontend Component**: [`AIAnomaliesWidget.tsx`](file:///d:/Fintrack/frontend/src/components/ai/AIAnomaliesWidget.tsx)
* **Dashboard Location**: Mounted on the main Dashboard overview page.

### Capabilities:
* **Subscription Price-Hike Detection**: Monitors recurring merchant transactions (e.g. *Netflix*, *Spotify*, *Jio*, *Electricity*, *Gym*, *Rent*). Automatically flags price increases $\ge 5\%$ with previous vs current amount comparison and percentage increase badges (`📈 Price Hike +30%`).
* **Duplicate Charge Detection**: Audits transaction timestamps and amounts to detect identical charges recorded within 24–48 hours (`👯 Duplicate Charge`).
* **Category Outlier Spike Detection**: Identifies recent individual transactions exceeding $2.5\times$ the user's historical category median (`⚡ Outlier Spike`).
* **Interactive Filter Tabs**: Filter anomalies by `All`, `Price Hikes 📈`, `Duplicates 👯`, or `Category Spikes ⚡`.
* **Clean State Security**: Shows a verified green shield badge (`🛡️ Financial Records Clean & Secure`) when 0 anomalies are detected.

---

## 🎙️ 12. AI Voice-Powered Hands-Free Expense Logger

* **API Endpoint**: `POST /api/v1/ai/parse-expense`
* **Web Speech Engine**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with fallback to browser native voice input.
* **Frontend Component**: [`VoiceLoggerModal.tsx`](file:///d:/Fintrack/frontend/src/components/ai/VoiceLoggerModal.tsx)
* **Trigger Access**: Integrated into [`ExpenseFormModal.tsx`](file:///d:/Fintrack/frontend/src/components/expenses/ExpenseFormModal.tsx) via the `🎙️ Voice Quick-Add` microphone button.

### Capabilities:
* **Natural Spoken Sentence Transcription**: Listens to spoken voice inputs in real-time (e.g. *"Spent 350 rupees for Uber auto to office using UPI"*) and transcribes speech into text without third-party audio API keys.
* **Multi-Currency Spoken Voice NLP Parsing**: Backend rule engine parses spoken currency variations (`rupees`, `bucks`, `rs`, `₹`, `inr`) and converts sentence details into structured fields:
  * **Title**: *"Uber auto to office"*
  * **Amount**: `350.00`
  * **Payment Mode**: `"upi"`
  * **Category**: Matched Category UUID (e.g. *Transport*)
* **Interactive Pulse Waveform UI**: Glassmorphic modal featuring interactive microphone toggle button, dynamic audio pulse visualizer, real-time live transcript display, and editable result summary cards.
* **1-Click Form Filling & Instant Logging**: User can review the parsed extraction, adjust values if needed, and click **"Fill Form"** to populate the expense modal or **"Log Expense Immediately"**.

---

## 🧪 Verification & Automated Testing

All AI features are backed by automated tests:
* **Backend Pytest Suite**: `pytest tests/test_ai_api.py -v` (9/9 AI tests passed, 19/19 total backend tests passed).
* **Frontend Build**: `npm run build` (13/13 static routes compiled with 0 errors).


