# Immediate Priority Task List

## 1. Deep Dive "Blueprint" View (Pathfinder)
**Objective**: Enable users to click on a generated Market Idea and see a comprehensive business blueprint.
- **Current State**: `MarketWidget` displays summaries. `MarketCard`, `WedgeCard`, `FinancialSimulator`, `CompetitorWidget` exist as separate components but are not fully integrated into a cohesive "Detail View".
- **Action**: 
    - Create a `components/BlueprintModal.tsx` that aggregates these widgets.
    - Update `MarketWidget` (in `ResultView.tsx`) to open this modal on click.
    - Wire `FinancialSimulator` to use the specific idea's data (pricing, market size).

## 2. Spark "Mission Control" & Functional Tabs (Spark)
**Objective**: Make the Spark Dashboard tabs functional (Mission Control, Timeline, Studio).
- **Current State**: Tabs exist in the sticky header but don't change the view; content is static "Welcome" card.
- **Action**:
    - Refactor `SparkDashboard.tsx` to conditionally render content based on `activeModule`.
    - **Mission Control**: Reuse/Integrate `TaskBoard.tsx` here.
    - **Launch Timeline**: Create a simple `TimelineWidget` (Gantt/List) for the "Timeline" tab.
    - **Studio**: Create a placeholder view for the asset library (which is currently just static markup).

## 3. Data Persistence & State Handoff
**Objective**: Ensure the ecosystem feels "real" by saving data and passing it between modes.
- **Current State**: Data is likely transient in React state.
- **Action**:
    - Implement `useLocalStorage` hook or simple persistence for `ikigaiResult`.
    - Ensure that when a user "Ignites" a campaign (switches to Spark), the *selected* idea becomes the "Active Venture" in Spark.
