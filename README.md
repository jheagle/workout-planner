# workout-planner

[![tests](https://github.com/jheagle/workout-planner/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/jheagle/workout-planner/actions/workflows/tests.yml)

Plan daily and weekly workouts based on goals and muscle groups.

## Data

The workout history lives in `database/` (json-fs-query records). Weights are stored as entered, in the unit the
equipment shows (`weight` and `unit`, kg or lbs), and the page shows them in the viewer's unit. Three scripts fill it:

- `node scripts/import-sheets.js upper=<csv> lower=<csv> core=<csv> [--replace] [--dry-run]` imports the history from
  the Google Sheets CSV exports. `--replace` re-imports the sheets' date range from scratch.
- `node scripts/migrate.js` runs the database migrations that haven't run yet (`assets/js/data/migrations.js`).
- `node scripts/apply-muscle-map.js` writes the muscle map (`assets/js/data/muscleMap.js`) into `database/`: the
  muscles, their regions, and each exercise's share of the work per muscle.

## Modules

<dl>
<dt><a href="#module_planSchema">planSchema</a></dt>
<dd><p>The shape of a plan: what the model must return (as a JSON schema, for structured outputs) and what the checks
read. The schema holds only the shape (types, required fields, no extra fields); ranges and rules (sets, reps,
weights the equipment can make, weekly volume) are the checks&#39; job (planChecks.js), so their errors can name the
exact field and the model can fix it.</p>
<p>A plan is weeks of training days. A day is placed by <code>dayOfWeek</code> (1 Monday to 7 Sunday), so the checks can see
rest between days; saving a plan turns these into future-dated workouts from its start date. LJS-2, 2026-11-26.</p>
</dd>
<dt><a href="#module_planFixture">planFixture</a></dt>
<dd><p>A small gym and history for the plan tests (and later the evals&#39; mocks): rows as the database holds them, a goal,
and a plan that passes every check, to break one rule at a time.</p>
</dd>
<dt><a href="#module_planContext">planContext</a></dt>
<dd><p>What a plan is built from, gathered by code (never by the model): the exercises this gym&#39;s equipment allows, each
with the muscles it works, its last session and an estimated one-rep max, plus the goal, the gym profile and the
muscles that need attention now. The same context goes to the model and to the checks. LJS-2, 2026-11-26.</p>
</dd>
<dt><a href="#module_planChecks">planChecks</a></dt>
<dd><p>The code that checks a plan: the model proposes, these decide. Every error names the exact field
(<code>weeks[1].days[0].exercises[2].weight</code>) and what&#39;s wrong with it, so one fix round can hand the model the list,
and the evals grade plans by the same checks. LJS-2, 2026-11-26.</p>
<p>How it reads: <code>checkPlan</code> lays the plan out flat once (every day and every exercise with its path), then runs
the rules in <code>PLAN_RULES</code>, one small function per rule, and collects their errors. To add a rule, write a function
and list it there. The limits are starting points, kept in <code>LIMITS</code> to tune from real plans.</p>
</dd>
<dt><a href="#module_gymProfile">gymProfile</a></dt>
<dd><p>The gym a plan is built for: which equipment there is, the weights each piece can actually be set to, and the
days and time there are to train. A plan&#39;s weights must be ones the equipment can make (a barbell can&#39;t hold 137
lbs with 2.5 lb plates), so every weight is rounded to its equipment&#39;s steps.</p>
<p>A loaded piece of equipment is <code>{unit, min, step, max}</code>: it makes min, min + step, min + 2 x step, ... up to max
(no max: no limit). A barbell with a 45 lb bar and 2.5 lb plates is min 45, step 5 (one plate a side). Equipment
with no weight of its own (a bench, a pull-up bar) is <code>{}</code>. LJS-2, 2026-11-26.</p>
</dd>
<dt><a href="#module_units">units</a></dt>
<dd><p>Weights in kg or lbs, and timed holds. A workout stores its weight as entered, in the unit the equipment shows
(<code>weight</code> as decimal text, since json-fs-query has no decimal type, and <code>unit</code>), and every weight is shown in the
viewer&#39;s preferred unit, with the entered value kept alongside. Holds are whole <code>seconds</code>. WP-8, 2026-11-26: most
gym equipment here is in lbs, while Joshua thinks in kg.</p>
</dd>
<dt><a href="#module_sheetImport">sheetImport</a></dt>
<dd><p>Importing Joshua&#39;s workout history from his Google Sheets (&quot;Workout Progress - Upper Body / Lower Body / Core&quot;,
exported as CSV). Each sheet is a grid: the first row is session dates (newest first), each later row an exercise,
and each cell what was done that day, as <code>;</code>-separated groups of <code>weight, reps</code>:</p>
<p>  300lbs, 10            one set of 10 at 300 lbs
  60lbs, 2x5            2 sets of 5
  50lbs, 6,10           a set of 6, then a set of 10
  3x8                   bodyweight: 3 sets of 8
  02:00:00 / 2x 30 seconds / 5x0:30   timed holds (Sheets turns 2:00 into 02:00:00)</p>
<p>Anything else is read as far as it can be, and the cell&#39;s own text is kept in the workout&#39;s note so nothing is lost.
This module only parses; scripts/import-sheets.js writes to the database.</p>
</dd>
<dt><a href="#module_muscleMap">muscleMap</a></dt>
<dd><p>The muscle map: every muscle (some split into regions that training can target separately) and how much of each
exercise&#39;s work each muscle does. Worked out with Joshua on 2026-11-26 (WP-1; the discussion and the reasons are in
tm&#39;s WP/muscle-map).</p>
<p>Rules:</p>
<ul>
<li>An exercise links to a region where its muscle has them (Chest: upper, mid/lower), otherwise to the muscle.</li>
<li>A rank is the muscle&#39;s share of the work, 0-100: 100 the target, 60-80 strong, 30-50 minor. Estimates, to be
fine-tuned.</li>
<li>No stabilizers, except the core on lifts that need heavy bracing (squats including hack and Smith, deadlifts,
RDLs, standing presses): abs, obliques and erector spinae get about 20.</li>
<li>An exercise is mapped for its usual form (cable cross: high to low).</li>
</ul>
</dd>
<dt><a href="#module_migrations">migrations</a></dt>
<dd><p>Changes to the database&#39;s records, in order. Each one checks whether it has already run, so <code>migrate()</code> can be run
any time: on database/ by scripts/migrate.js, and on every test database (testDatabase.js), so tests always see
the current schema even before database/ has been migrated.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#logWorkout">logWorkout</a></dt>
<dd><p>Log a new workout entry. The weight is stored as entered, in the unit the equipment shows.</p>
</dd>
<dt><a href="#updateWorkout">updateWorkout</a></dt>
<dd><p>Update an existing workout entry - e.g. correcting the plan with what was actually done.</p>
</dd>
<dt><a href="#addExercise">addExercise</a></dt>
<dd><p>Add a new exercise, with the muscles it works (primary/secondary, by whatever rank you give).</p>
</dd>
<dt><a href="#exercise">exercise</a> ⇒ <code>function</code></dt>
<dd><p>A value that is the _id of the exercise with this name, once it&#39;s inserted: exercises&#39; ids are generated on insert
(json-fs-query&#39;s <code>auto</code> replaces any _id given), so rows refer to them through this.</p>
</dd>
<dt><a href="#seedRows">seedRows</a></dt>
<dd><p>The rows every test database starts with: the app&#39;s original seed data (14 muscles, 3 exercises each linked to one
muscle, and 6 workouts on 2024-06-02 and 2024-06-05). Fixed here, so tests never depend on the real database/,
which changes with every workout logged.</p>
</dd>
<dt><a href="#createTestDatabase">createTestDatabase</a> ⇒ <code>Promise.&lt;Object.&lt;string, Array.&lt;Object&gt;&gt;&gt;</code></dt>
<dd><p>Build a test database at destination: every record the real database has, with the same fields and keys (read
from its record files, so a schema change reaches the tests, then migrated), holding only the given rows. Configures
json-fs-query to use it.</p>
</dd>
<dt><a href="#createReads">createReads</a> ⇒ <code>Object</code></dt>
<dd><p>The app&#39;s reads, given the json-fs-query <code>query</code> and <code>quote</code> to run them with: Node&#39;s (workoutQueries.js, for the
API server and the tests) or the browser build&#39;s (browserReads.js, for the page, which reads database/ from its own
origin over fetch()). Reads need no server; only writes do.</p>
</dd>
<dt><a href="#musclePriority">musclePriority</a></dt>
<dd><p>Rank muscles by how much they need attention right now, from a real read of the database: every muscle (including
ones never worked at all), and every workout row with the muscles its exercise works.</p>
<p>Work is counted in weighted sets: a workout row&#39;s sets times the muscle&#39;s share of the exercise (rank / 100), so 3
sets of bench press give the mid and lower chest 3 and the front deltoid 1.5. A muscle counts as worked on a day
with at least WORKED_DAY_SETS weighted sets. It needs priority when it has recovered (RECOVERY_DAYS since it was
last worked, or never worked) and is still short of the weekly target in the last 7 days. Muscles needing priority
sort first, the biggest shortfall first, then the longest since worked.</p>
<p>A muscle split into regions (Pectorals: upper chest, mid and lower chest) is ranked by its regions, since exercises
link to those: the muscle itself isn&#39;t listed, and each region&#39;s name starts with the muscle&#39;s (<code>group</code> is the
muscle&#39;s name, for grouping).</p>
</dd>
<dt><a href="#localDate">localDate</a></dt>
<dd><p>A date as &#39;YYYY-MM-DD&#39; in the machine&#39;s own timezone - the shape every workout&#39;s date uses. Not
toISOString().slice(0, 10): that&#39;s the UTC date, which is already tomorrow in the evening anywhere
west of UTC (21:30 in Toronto is 01:30 UTC).</p>
</dd>
<dt><a href="#workout">workout</a> ⇒ <code>DomItem</code></dt>
<dd><p>Generates a table for a workout plan.</p>
</dd>
<dt><a href="#musclePriorityList">musclePriorityList</a> ⇒ <code>Object.&lt;DomItem&gt;</code></dt>
<dd><p>Generates a table ranking muscles by how much they need attention right now.</p>
</dd>
<dt><a href="#logWorkoutForm">logWorkoutForm</a> ⇒ <code>Object</code></dt>
<dd><p>Builds the log-workout form&#39;s DOM structure. No event wiring here - see exercisePicker.js&#39;s
own note on why that has to happen after this is attached into the real document and rendered.
The weight is entered in the unit the equipment shows (the unit picker starts on the exercise&#39;s last unit).</p>
</dd>
<dt><a href="#readFormValues">readFormValues</a></dt>
<dd><p>Reads the form&#39;s current field values, independent of which button triggered it. A hold&#39;s time (&#39;0:45&#39;, &#39;45s&#39;)
becomes seconds.</p>
</dd>
<dt><a href="#wireLogWorkoutFormEvents">wireLogWorkoutFormEvents</a></dt>
<dd><p>Wires the form&#39;s submit and update buttons - see logWorkoutForm&#39;s own note on timing.</p>
</dd>
<dt><a href="#formatLastSession">formatLastSession</a> ⇒ <code>string</code></dt>
<dd><p>A session in one line, its weight in the viewer&#39;s unit and, when the equipment&#39;s unit differs, the weight as
entered in brackets: &quot;Last time: 81.6 kg (180 lbs), 3x10 on 2024-06-05&quot;. A hold shows its time instead.</p>
</dd>
<dt><a href="#lastSessionDisplay">lastSessionDisplay</a> ⇒ <code>DomItem</code></dt>
<dd></dd>
<dt><a href="#exercisePicker">exercisePicker</a> ⇒ <code>Object</code></dt>
<dd><p>Builds the muscle -&gt; exercise picker&#39;s DOM structure. No event wiring here - fullAddEventListener
needs a complete parentItem chain up to the real document root (it throws otherwise), which a
freshly-built, not-yet-attached DomItem doesn&#39;t have yet. Call wireExercisePickerEvents once this
is attached into the real document and rendered.</p>
</dd>
<dt><a href="#wireExercisePickerEvents">wireExercisePickerEvents</a></dt>
<dd><p>Wires the picker&#39;s change events, once it&#39;s attached into the real document and rendered -
see exercisePicker&#39;s own note on why this can&#39;t happen at construction time.</p>
</dd>
<dt><a href="#detail">detail</a> ⇒ <code>DomItem</code></dt>
<dd><p>Generates a menu with the provided index as the currently selected item.</p>
</dd>
<dt><a href="#addExerciseForm">addExerciseForm</a> ⇒ <code>Object</code></dt>
<dd><p>Builds the add-exercise form&#39;s DOM structure. No event wiring here - see exercisePicker.js&#39;s
own note on why that has to happen after this is attached into the real document and rendered.
Primary and secondary are two separate multi-selects (rather than one picker with a per-muscle
rank) - a real exercise&#39;s muscles split cleanly into those two buckets, and a plain multi-select
needs no dynamic add/remove row UI to support picking several of each.</p>
</dd>
<dt><a href="#wireAddExerciseFormEvents">wireAddExerciseFormEvents</a></dt>
<dd><p>Wires the form&#39;s submit button - see addExerciseForm&#39;s own note on timing.</p>
</dd>
<dt><a href="#responsiveTable">responsiveTable</a> ⇒ <code>Object.&lt;DomItem&gt;</code></dt>
<dd><p>Generates a menu with the provided index as the currently selected item.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#weightAssignments">weightAssignments(weight, unit, [clear])</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>A weight as query assignments: the amount as decimal text (json-fs-query has no decimal type) and its unit. An
empty or missing amount assigns nothing, unless <code>clear</code> is set (an update clearing the weight).</p>
</dd>
<dt><a href="#dayNumber">dayNumber(date)</a></dt>
<dd><p>A &#39;YYYY-MM-DD&#39; date as a whole day number, so two dates are compared as calendar days, never as moments: a
workout&#39;s date has no time of day, and new Date(&#39;YYYY-MM-DD&#39;) is midnight UTC, which in the evening west of UTC
is already more than a day before the local &quot;now&quot; (21:30 in Toronto counted yesterday&#39;s workout as 2 days ago).</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#PlanExercise">PlanExercise</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#Plan">Plan</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#Goal">Goal</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#ContextExercise">ContextExercise</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#PlanContext">PlanContext</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="module_planSchema"></a>

## planSchema
The shape of a plan: what the model must return (as a JSON schema, for structured outputs) and what the checks
read. The schema holds only the shape (types, required fields, no extra fields); ranges and rules (sets, reps,
weights the equipment can make, weekly volume) are the checks' job (planChecks.js), so their errors can name the
exact field and the model can fix it.

A plan is weeks of training days. A day is placed by `dayOfWeek` (1 Monday to 7 Sunday), so the checks can see
rest between days; saving a plan turns these into future-dated workouts from its start date. LJS-2, 2026-11-26.

<a name="module_planSchema.planSchema"></a>

### planSchema.planSchema
The JSON schema of a plan, for the model's structured output.

**Kind**: static constant of [<code>planSchema</code>](#module_planSchema)  
<a name="module_planFixture"></a>

## planFixture
A small gym and history for the plan tests (and later the evals' mocks): rows as the database holds them, a goal,
and a plan that passes every check, to break one rule at a time.

<a name="module_planContext"></a>

## planContext
What a plan is built from, gathered by code (never by the model): the exercises this gym's equipment allows, each
with the muscles it works, its last session and an estimated one-rep max, plus the goal, the gym profile and the
muscles that need attention now. The same context goes to the model and to the checks. LJS-2, 2026-11-26.


* [planContext](#module_planContext)
    * _static_
        * [.estimateMax](#module_planContext.estimateMax) ⇒ <code>number</code>
        * [.readPlanRows](#module_planContext.readPlanRows) ⇒ <code>Promise.&lt;PlanRows&gt;</code>
        * [.buildPlanContext](#module_planContext.buildPlanContext) ⇒ [<code>PlanContext</code>](#PlanContext)
    * _inner_
        * [~PlanRows](#module_planContext..PlanRows) : <code>Object</code>

<a name="module_planContext.estimateMax"></a>

### planContext.estimateMax ⇒ <code>number</code>
A one-rep max estimated from a set (Epley): weight x (1 + reps / 30); one rep is the weight itself.

**Kind**: static constant of [<code>planContext</code>](#module_planContext)  

| Param | Type |
| --- | --- |
| amount | <code>number</code> | 
| reps | <code>number</code> | 

<a name="module_planContext.readPlanRows"></a>

### planContext.readPlanRows ⇒ <code>Promise.&lt;PlanRows&gt;</code>
Every row a plan's context needs, read whole (joined in code, as reads.js does).

**Kind**: static constant of [<code>planContext</code>](#module_planContext)  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>function</code> | json-fs-query's |

<a name="module_planContext.buildPlanContext"></a>

### planContext.buildPlanContext ⇒ [<code>PlanContext</code>](#PlanContext)
The context for one plan.

**Kind**: static constant of [<code>planContext</code>](#module_planContext)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.goal | [<code>Goal</code>](#Goal) |  |
| options.profile | <code>GymProfile</code> |  |
| options.rows | <code>PlanRows</code> |  |
| [options.today] | <code>Date</code> | injectable for testing; only its local date counts |

<a name="module_planContext..PlanRows"></a>

### planContext~PlanRows : <code>Object</code>
**Kind**: inner typedef of [<code>planContext</code>](#module_planContext)  
**Properties**

| Name | Type |
| --- | --- |
| muscles | <code>Array.&lt;Object&gt;</code> | 
| exercises | <code>Array.&lt;Object&gt;</code> | 
| exerciseMuscle | <code>Array.&lt;Object&gt;</code> | 
| exerciseEquipment | <code>Array.&lt;Object&gt;</code> | 
| workouts | <code>Array.&lt;Object&gt;</code> | 

<a name="module_planChecks"></a>

## planChecks
The code that checks a plan: the model proposes, these decide. Every error names the exact field
(`weeks[1].days[0].exercises[2].weight`) and what's wrong with it, so one fix round can hand the model the list,
and the evals grade plans by the same checks. LJS-2, 2026-11-26.

How it reads: `checkPlan` lays the plan out flat once (every day and every exercise with its path), then runs
the rules in `PLAN_RULES`, one small function per rule, and collects their errors. To add a rule, write a function
and list it there. The limits are starting points, kept in `LIMITS` to tune from real plans.


* [planChecks](#module_planChecks)
    * _static_
        * [.checkGoal](#module_planChecks.checkGoal) ⇒ <code>Array.&lt;PlanError&gt;</code>
        * [.PLAN_RULES](#module_planChecks.PLAN_RULES)
        * [.checkPlan](#module_planChecks.checkPlan) ⇒ <code>Array.&lt;PlanError&gt;</code>
        * [.formatErrors](#module_planChecks.formatErrors) ⇒ <code>string</code>
    * _inner_
        * [~layOut(plan, context)](#module_planChecks..layOut) ⇒ <code>PlanLayout</code>
        * [~weightedSetsByMuscleAndDay()](#module_planChecks..weightedSetsByMuscleAndDay) ⇒ <code>Map.&lt;string, Map.&lt;number, number&gt;&gt;</code>
        * [~weeksMatchGoal()](#module_planChecks..weeksMatchGoal)
        * [~weeksAreNumbered()](#module_planChecks..weeksAreNumbered)
        * [~daysFitTheWeek()](#module_planChecks..daysFitTheWeek)
        * [~weekdaysAreValid()](#module_planChecks..weekdaysAreValid)
        * [~daysHaveExercises()](#module_planChecks..daysHaveExercises)
        * [~exercisesAreKnown()](#module_planChecks..exercisesAreKnown)
        * [~setsAndRepsInRange()](#module_planChecks..setsAndRepsInRange)
        * [~weightsFitEquipment()](#module_planChecks..weightsFitEquipment)
        * [~sessionsFitTheTime()](#module_planChecks..sessionsFitTheTime)
        * [~mustIncludesEveryWeek()](#module_planChecks..mustIncludesEveryWeek)
        * [~weeklySetsPerMuscle()](#module_planChecks..weeklySetsPerMuscle)
        * [~restBetweenHardDays()](#module_planChecks..restBetweenHardDays)
        * [~weightsRiseGradually()](#module_planChecks..weightsRiseGradually)
        * [~lastWeekTestsGoal()](#module_planChecks..lastWeekTestsGoal)
        * [~PlanError](#module_planChecks..PlanError) : <code>Object</code>
        * [~PlanLayout](#module_planChecks..PlanLayout) : <code>Object</code>

<a name="module_planChecks.checkGoal"></a>

### planChecks.checkGoal ⇒ <code>Array.&lt;PlanError&gt;</code>
Whether a goal can be planned for: its exercise is one this gym allows, and it's a strength goal v1 handles in a
realistic time.

**Kind**: static constant of [<code>planChecks</code>](#module_planChecks)  

| Param | Type |
| --- | --- |
| goal | [<code>Goal</code>](#Goal) | 
| context | [<code>PlanContext</code>](#PlanContext) | 

<a name="module_planChecks.PLAN_RULES"></a>

### planChecks.PLAN\_RULES
Every rule a plan must pass, in the order their errors are listed: the plan's shape, then each exercise, then
each session and week, then progress over the weeks.

**Kind**: static constant of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks.checkPlan"></a>

### planChecks.checkPlan ⇒ <code>Array.&lt;PlanError&gt;</code>
Every problem with a plan, or none.

**Kind**: static constant of [<code>planChecks</code>](#module_planChecks)  

| Param | Type |
| --- | --- |
| plan | [<code>Plan</code>](#Plan) | 
| context | [<code>PlanContext</code>](#PlanContext) | 

<a name="module_planChecks.formatErrors"></a>

### planChecks.formatErrors ⇒ <code>string</code>
Errors as the list handed back to the model in the fix round: one line each, the field first.

**Kind**: static constant of [<code>planChecks</code>](#module_planChecks)  

| Param | Type |
| --- | --- |
| errors | <code>Array.&lt;PlanError&gt;</code> | 

<a name="module_planChecks..layOut"></a>

### planChecks~layOut(plan, context) ⇒ <code>PlanLayout</code>
The plan as flat lists, each entry with its path, so every rule is a simple loop.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  

| Param | Type |
| --- | --- |
| plan | [<code>Plan</code>](#Plan) | 
| context | [<code>PlanContext</code>](#PlanContext) | 

<a name="module_planChecks..weightedSetsByMuscleAndDay"></a>

### planChecks~weightedSetsByMuscleAndDay() ⇒ <code>Map.&lt;string, Map.&lt;number, number&gt;&gt;</code>
Weighted sets per muscle per day: each exercise's sets times the muscle's share of it (3 sets of bench at 50%
triceps is 1.5 for triceps).

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
**Returns**: <code>Map.&lt;string, Map.&lt;number, number&gt;&gt;</code> - muscleId -> dayNumber -> weighted sets  
<a name="module_planChecks..weeksMatchGoal"></a>

### planChecks~weeksMatchGoal()
The plan has as many weeks as the goal.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..weeksAreNumbered"></a>

### planChecks~weeksAreNumbered()
Weeks are numbered 1, 2, 3, ... in order.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..daysFitTheWeek"></a>

### planChecks~daysFitTheWeek()
No week has more training days than the profile allows.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..weekdaysAreValid"></a>

### planChecks~weekdaysAreValid()
Each day is a weekday from 1 (Monday) to 7 (Sunday), once per week.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..daysHaveExercises"></a>

### planChecks~daysHaveExercises()
Every training day has at least one exercise.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..exercisesAreKnown"></a>

### planChecks~exercisesAreKnown()
Every exercise is one from the context (which already leaves out the no-gos), and not on the no-go list.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..setsAndRepsInRange"></a>

### planChecks~setsAndRepsInRange()
Sets and reps are whole numbers in range.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..weightsFitEquipment"></a>

### planChecks~weightsFitEquipment()
A loaded exercise names its equipment and has a weight that equipment can make (the error says the nearest it
can); a bodyweight exercise has neither.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..sessionsFitTheTime"></a>

### planChecks~sessionsFitTheTime()
A day's sets fit in the session: a warm-up, then each set with its rest.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..mustIncludesEveryWeek"></a>

### planChecks~mustIncludesEveryWeek()
Every must-include exercise is in every week.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..weeklySetsPerMuscle"></a>

### planChecks~weeklySetsPerMuscle()
No muscle gets more than the weekly limit of weighted sets in any week.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..restBetweenHardDays"></a>

### planChecks~restBetweenHardDays()
A muscle worked hard one day gets the next day off from hard work (also from a Sunday into the next Monday).

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..weightsRiseGradually"></a>

### planChecks~weightsRiseGradually()
Each lift's top weight rises at most 10% a week (or one step of its equipment, when that's more), starting from
its last logged session. Dropping is always fine.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..lastWeekTestsGoal"></a>

### planChecks~lastWeekTestsGoal()
The last week tests the goal: its lift for the goal's reps, at the goal's weight (rounded to the equipment) or more.

**Kind**: inner method of [<code>planChecks</code>](#module_planChecks)  
<a name="module_planChecks..PlanError"></a>

### planChecks~PlanError : <code>Object</code>
**Kind**: inner typedef of [<code>planChecks</code>](#module_planChecks)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | the field, e.g. 'weeks[1].days[0].exercises[2].weight'; '' for the plan as a whole |
| message | <code>string</code> |  |

<a name="module_planChecks..PlanLayout"></a>

### planChecks~PlanLayout : <code>Object</code>
**Kind**: inner typedef of [<code>planChecks</code>](#module_planChecks)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| weeks | <code>Array.&lt;Object&gt;</code> | the plan's weeks (none when it has none) |
| days | <code>Array.&lt;{path: string, weekIndex: number, day: Object, dayNumber: number}&gt;</code> | dayNumber counts from the plan's first Monday (week 2's Monday is 8), so rest between days is a subtraction |
| items | <code>Array.&lt;{path: string, weekIndex: number, dayNumber: number, item: Object, exercise: (Object\|undefined)}&gt;</code> | every exercise in the plan, with its exercise from the context (undefined when the id isn't one) |

<a name="module_gymProfile"></a>

## gymProfile
The gym a plan is built for: which equipment there is, the weights each piece can actually be set to, and the
days and time there are to train. A plan's weights must be ones the equipment can make (a barbell can't hold 137
lbs with 2.5 lb plates), so every weight is rounded to its equipment's steps.

A loaded piece of equipment is `{unit, min, step, max}`: it makes min, min + step, min + 2 x step, ... up to max
(no max: no limit). A barbell with a 45 lb bar and 2.5 lb plates is min 45, step 5 (one plate a side). Equipment
with no weight of its own (a bench, a pull-up bar) is `{}`. LJS-2, 2026-11-26.


* [gymProfile](#module_gymProfile)
    * _static_
        * [.placeholderProfile](#module_gymProfile.placeholderProfile) : <code>GymProfile</code>
        * [.isLoaded](#module_gymProfile.isLoaded) ⇒ <code>boolean</code>
        * [.roundToEquipment](#module_gymProfile.roundToEquipment) ⇒ <code>Object</code>
        * [.canMake](#module_gymProfile.canMake) ⇒ <code>boolean</code>
    * _inner_
        * [~Equipment](#module_gymProfile..Equipment) : <code>Object</code>
        * [~GymProfile](#module_gymProfile..GymProfile) : <code>Object</code>

<a name="module_gymProfile.placeholderProfile"></a>

### gymProfile.placeholderProfile : <code>GymProfile</code>
PLACEHOLDER values, not Joshua's gym yet: his list (equipment steps, days, session length, must-haves and
no-gos, the v1 goal) replaces these. The equipment ids are the ones in database/equipment.

**Kind**: static constant of [<code>gymProfile</code>](#module_gymProfile)  
<a name="module_gymProfile.isLoaded"></a>

### gymProfile.isLoaded ⇒ <code>boolean</code>
Whether the equipment takes a weight (a barbell, a machine) or not (a bench).

**Kind**: static constant of [<code>gymProfile</code>](#module_gymProfile)  

| Param | Type |
| --- | --- |
| equipment | <code>Equipment</code> | 

<a name="module_gymProfile.roundToEquipment"></a>

### gymProfile.roundToEquipment ⇒ <code>Object</code>
The nearest weight the equipment can make, in its own unit; a weight in another unit is converted first.
Below its lightest it's the lightest, above its heaviest the heaviest.

**Kind**: static constant of [<code>gymProfile</code>](#module_gymProfile)  

| Param | Type | Description |
| --- | --- | --- |
| weight | <code>Object</code> |  |
| equipment | <code>Equipment</code> | loaded |

<a name="module_gymProfile.canMake"></a>

### gymProfile.canMake ⇒ <code>boolean</code>
Whether the equipment can make exactly this weight, in its own unit.

**Kind**: static constant of [<code>gymProfile</code>](#module_gymProfile)  

| Param | Type | Description |
| --- | --- | --- |
| weight | <code>Object</code> |  |
| equipment | <code>Equipment</code> | loaded |

<a name="module_gymProfile..Equipment"></a>

### gymProfile~Equipment : <code>Object</code>
**Kind**: inner typedef of [<code>gymProfile</code>](#module_gymProfile)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [unit] | <code>string</code> | 'kg' or 'lbs'; only loaded equipment has one |
| [min] | <code>number</code> | the lightest weight it makes |
| [step] | <code>number</code> | the smallest change in weight |
| [max] | <code>number</code> | the heaviest weight it makes (none: no limit) |

<a name="module_gymProfile..GymProfile"></a>

### gymProfile~GymProfile : <code>Object</code>
**Kind**: inner typedef of [<code>gymProfile</code>](#module_gymProfile)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| unit | <code>string</code> | the unit plans are shown in |
| daysPerWeek | <code>number</code> | most training days in a week |
| sessionMinutes | <code>number</code> | longest session |
| bodyweight | <code>Object</code> \| <code>null</code> |  |
| equipment | <code>Object.&lt;string, Equipment&gt;</code> | by equipment id; missing means the gym doesn't have it |
| mustInclude | <code>Array.&lt;string&gt;</code> | exercise ids |
| avoid | <code>Array.&lt;string&gt;</code> | exercise ids |

<a name="module_units"></a>

## units
Weights in kg or lbs, and timed holds. A workout stores its weight as entered, in the unit the equipment shows
(`weight` as decimal text, since json-fs-query has no decimal type, and `unit`), and every weight is shown in the
viewer's preferred unit, with the entered value kept alongside. Holds are whole `seconds`. WP-8, 2026-11-26: most
gym equipment here is in lbs, while Joshua thinks in kg.


* [units](#module_units)
    * [.KG_PER_LB](#module_units.KG_PER_LB)
    * [.WEIGHT_UNITS](#module_units.WEIGHT_UNITS)
    * [.convertWeight](#module_units.convertWeight) ⇒ <code>number</code>
    * [.formatAmount](#module_units.formatAmount) ⇒ <code>string</code>
    * [.workoutWeight](#module_units.workoutWeight) ⇒ <code>Object</code> \| <code>null</code>
    * [.readWeightText](#module_units.readWeightText) ⇒ <code>Object</code>
    * [.showWeight](#module_units.showWeight) ⇒ <code>Object</code> \| <code>null</code>
    * [.formatSeconds](#module_units.formatSeconds) ⇒ <code>string</code>
    * [.defaultUnit](#module_units.defaultUnit) ⇒ <code>string</code>

<a name="module_units.KG_PER_LB"></a>

### units.KG\_PER\_LB
One pound in kilograms (exact, by definition).

**Kind**: static constant of [<code>units</code>](#module_units)  
<a name="module_units.WEIGHT_UNITS"></a>

### units.WEIGHT\_UNITS
The units a weight can be in.

**Kind**: static constant of [<code>units</code>](#module_units)  
<a name="module_units.convertWeight"></a>

### units.convertWeight ⇒ <code>number</code>
A weight in another unit, unrounded.

**Kind**: static constant of [<code>units</code>](#module_units)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> |  |
| from | <code>string</code> | 'kg' or 'lbs' |
| to | <code>string</code> | 'kg' or 'lbs' |

<a name="module_units.formatAmount"></a>

### units.formatAmount ⇒ <code>string</code>
A number for people: at most one decimal, none when it's whole (67.5, 30.6, 225).

**Kind**: static constant of [<code>units</code>](#module_units)  

| Param | Type |
| --- | --- |
| amount | <code>number</code> | 

<a name="module_units.workoutWeight"></a>

### units.workoutWeight ⇒ <code>Object</code> \| <code>null</code>
A workout's weight, or null when it has none: `weight` and `unit`, or the old `weight_effort` text ('180lbs',
'2x40lbs', which is 80 lbs), so rows from before the change still read.

**Kind**: static constant of [<code>units</code>](#module_units)  

| Param | Type |
| --- | --- |
| workout | <code>Object</code> | 

<a name="module_units.readWeightText"></a>

### units.readWeightText ⇒ <code>Object</code>
The old `weight_effort` text read as a weight or a hold: '180lbs', '2x40lbs' (two 40s: 80 lbs), '0:30', '2:00',
'30 seconds'. Anything else reads as neither.

**Kind**: static constant of [<code>units</code>](#module_units)  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 

<a name="module_units.showWeight"></a>

### units.showWeight ⇒ <code>Object</code> \| <code>null</code>
A weight shown in the viewer's unit: '81.6 kg'. When that isn't the unit it was entered in, `entered` is the
original ('180 lbs'), to show alongside.

**Kind**: static constant of [<code>units</code>](#module_units)  

| Param | Type | Description |
| --- | --- | --- |
| weight | <code>Object</code> \| <code>null</code> |  |
| preferredUnit | <code>string</code> | 'kg' or 'lbs' |

<a name="module_units.formatSeconds"></a>

### units.formatSeconds ⇒ <code>string</code>
Seconds as a clock: 30 is '0:30', 125 is '2:05'.

**Kind**: static constant of [<code>units</code>](#module_units)  

| Param | Type |
| --- | --- |
| seconds | <code>number</code> | 

<a name="module_units.defaultUnit"></a>

### units.defaultUnit ⇒ <code>string</code>
A starting unit for someone who hasn't chosen one: lbs where it's the everyday unit (the US, Liberia, Myanmar),
kg everywhere else.

**Kind**: static constant of [<code>units</code>](#module_units)  

| Param | Type | Description |
| --- | --- | --- |
| [locale] | <code>string</code> | e.g. 'en-US' |

<a name="module_sheetImport"></a>

## sheetImport
Importing Joshua's workout history from his Google Sheets ("Workout Progress - Upper Body / Lower Body / Core",
exported as CSV). Each sheet is a grid: the first row is session dates (newest first), each later row an exercise,
and each cell what was done that day, as `;`-separated groups of `weight, reps`:

  300lbs, 10            one set of 10 at 300 lbs
  60lbs, 2x5            2 sets of 5
  50lbs, 6,10           a set of 6, then a set of 10
  3x8                   bodyweight: 3 sets of 8
  02:00:00 / 2x 30 seconds / 5x0:30   timed holds (Sheets turns 2:00 into 02:00:00)

Anything else is read as far as it can be, and the cell's own text is kept in the workout's note so nothing is lost.
This module only parses; scripts/import-sheets.js writes to the database.


* [sheetImport](#module_sheetImport)
    * _static_
        * [.parseCsv](#module_sheetImport.parseCsv) ⇒ <code>Array.&lt;Array.&lt;string&gt;&gt;</code>
        * [.cleanName](#module_sheetImport.cleanName) ⇒ <code>string</code>
        * [.nameKey](#module_sheetImport.nameKey) ⇒ <code>string</code>
        * [.readDuration](#module_sheetImport.readDuration) ⇒ <code>string</code> \| <code>null</code>
        * [.readReps](#module_sheetImport.readReps) ⇒ <code>Array.&lt;{sets: number, reps: number}&gt;</code> \| <code>null</code>
        * [.readGroup](#module_sheetImport.readGroup) ⇒ <code>Object</code>
        * [.readCell](#module_sheetImport.readCell) ⇒ <code>Object</code>
        * [.parseSheet](#module_sheetImport.parseSheet) ⇒ <code>Object</code>
        * [.guessEquipment](#module_sheetImport.guessEquipment) ⇒ <code>Array.&lt;string&gt;</code>
    * _inner_
        * [~spellingFixes](#module_sheetImport..spellingFixes)
        * [~equipmentRules](#module_sheetImport..equipmentRules)

<a name="module_sheetImport.parseCsv"></a>

### sheetImport.parseCsv ⇒ <code>Array.&lt;Array.&lt;string&gt;&gt;</code>
Parse CSV text (RFC 4180: quoted fields, "" for a quote, commas and line breaks inside quotes, CRLF, a BOM).

**Kind**: static constant of [<code>sheetImport</code>](#module_sheetImport)  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 

<a name="module_sheetImport.cleanName"></a>

### sheetImport.cleanName ⇒ <code>string</code>
An exercise name as stored: trimmed, single-spaced, known typos fixed.

**Kind**: static constant of [<code>sheetImport</code>](#module_sheetImport)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 

<a name="module_sheetImport.nameKey"></a>

### sheetImport.nameKey ⇒ <code>string</code>
The key two names are matched by: case and spacing don't matter ("Seated leg curl" is "Seated Leg Curl").

**Kind**: static constant of [<code>sheetImport</code>](#module_sheetImport)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 

<a name="module_sheetImport.readDuration"></a>

### sheetImport.readDuration ⇒ <code>string</code> \| <code>null</code>
A timed effort as written in the sheet, or null when the text isn't a time: `02:00:00` (Sheets' reading of 2:00)
becomes `2:00`, `00:20` becomes `0:20`, `30 seconds` stays.

**Kind**: static constant of [<code>sheetImport</code>](#module_sheetImport)  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 

<a name="module_sheetImport.readReps"></a>

### sheetImport.readReps ⇒ <code>Array.&lt;{sets: number, reps: number}&gt;</code> \| <code>null</code>
Read a list of reps like `10`, `2x5`, `6,10`, `2x6, 4` into set groups.

**Kind**: static constant of [<code>sheetImport</code>](#module_sheetImport)  
**Returns**: <code>Array.&lt;{sets: number, reps: number}&gt;</code> \| <code>null</code> - null when any part isn't a rep count.  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 

<a name="module_sheetImport.readGroup"></a>

### sheetImport.readGroup ⇒ <code>Object</code>
One `;`-separated group of a cell: a weight (optional) and its reps, or a timed hold.

**Kind**: static constant of [<code>sheetImport</code>](#module_sheetImport)  
**Returns**: <code>Object</code> - exact is false when part of the text couldn't be read (the cell's text then goes in the note).  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 

<a name="module_sheetImport.readCell"></a>

### sheetImport.readCell ⇒ <code>Object</code>
A whole cell: its groups, in order.

**Kind**: static constant of [<code>sheetImport</code>](#module_sheetImport)  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 

<a name="module_sheetImport.parseSheet"></a>

### sheetImport.parseSheet ⇒ <code>Object</code>
A sheet's CSV as workouts.

**Kind**: static constant of [<code>sheetImport</code>](#module_sheetImport)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>string</code> |  |  |
| area | <code>string</code> |  | The sheet's body area, e.g. 'upper'. |
| [fixes] | <code>Array.&lt;{area: string, exercise: string, text: string, date: (string\|undefined), moveTo: (string\|undefined), moveArea: (string\|undefined)}&gt;</code> | <code>[]</code> | Single cells corrected by hand, found by sheet, exercise and cell text: `date` dates a cell in a column with no date; `moveTo` logs the cell under another exercise (in `moveArea`, default this sheet's). |

<a name="module_sheetImport.guessEquipment"></a>

### sheetImport.guessEquipment ⇒ <code>Array.&lt;string&gt;</code>
Equipment an exercise probably uses, from its name. A guess for Joshua to review; an empty list means bodyweight
or unknown.

**Kind**: static constant of [<code>sheetImport</code>](#module_sheetImport)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 

<a name="module_sheetImport..spellingFixes"></a>

### sheetImport~spellingFixes
Known misspellings in the sheets, fixed on import (the original text goes in the report).

**Kind**: inner constant of [<code>sheetImport</code>](#module_sheetImport)  
<a name="module_sheetImport..equipmentRules"></a>

### sheetImport~equipmentRules
Equipment guessed from an exercise's name, checked in order; a name can match several.

**Kind**: inner constant of [<code>sheetImport</code>](#module_sheetImport)  
<a name="module_muscleMap"></a>

## muscleMap
The muscle map: every muscle (some split into regions that training can target separately) and how much of each
exercise's work each muscle does. Worked out with Joshua on 2026-11-26 (WP-1; the discussion and the reasons are in
tm's WP/muscle-map).

Rules:
- An exercise links to a region where its muscle has them (Chest: upper, mid/lower), otherwise to the muscle.
- A rank is the muscle's share of the work, 0-100: 100 the target, 60-80 strong, 30-50 minor. Estimates, to be
  fine-tuned.
- No stabilizers, except the core on lifts that need heavy bracing (squats including hack and Smith, deadlifts,
  RDLs, standing presses): abs, obliques and erector spinae get about 20.
- An exercise is mapped for its usual form (cable cross: high to low).


* [muscleMap](#module_muscleMap)
    * _static_
        * [.muscles](#module_muscleMap.muscles) : <code>Array.&lt;{\_id: string, name: string, alias: string, parent\_id: (string\|undefined)}&gt;</code>
        * [.exerciseShares](#module_muscleMap.exerciseShares) : <code>Object.&lt;string, Object.&lt;string, number&gt;&gt;</code>
        * [.exerciseDescriptions](#module_muscleMap.exerciseDescriptions)
        * [.applyMuscleMap](#module_muscleMap.applyMuscleMap) ⇒ <code>Promise.&lt;{musclesAdded: Array.&lt;string&gt;, musclesUpdated: Array.&lt;string&gt;, exercisesLinked: number, links: number, unmapped: Array.&lt;string&gt;, missing: Array.&lt;string&gt;}&gt;</code>
    * _inner_
        * [~U](#module_muscleMap..U)
        * [~CORE](#module_muscleMap..CORE)
        * [~pressTriceps(share)](#module_muscleMap..pressTriceps) ⇒ <code>Object.&lt;string, number&gt;</code>

<a name="module_muscleMap.muscles"></a>

### muscleMap.muscles : <code>Array.&lt;{\_id: string, name: string, alias: string, parent\_id: (string\|undefined)}&gt;</code>
Every muscle. The first 14 keep the ids the app started with; a muscle with regions is a parent, and its regions
name it in `parent_id`.

**Kind**: static constant of [<code>muscleMap</code>](#module_muscleMap)  
<a name="module_muscleMap.exerciseShares"></a>

### muscleMap.exerciseShares : <code>Object.&lt;string, Object.&lt;string, number&gt;&gt;</code>
Each exercise's muscles, by exercise name (matched without case or spacing) to muscle or region id and share.

**Kind**: static constant of [<code>muscleMap</code>](#module_muscleMap)  
<a name="module_muscleMap.exerciseDescriptions"></a>

### muscleMap.exerciseDescriptions
Descriptions written for users, by exercise name.

**Kind**: static constant of [<code>muscleMap</code>](#module_muscleMap)  
<a name="module_muscleMap.applyMuscleMap"></a>

### muscleMap.applyMuscleMap ⇒ <code>Promise.&lt;{musclesAdded: Array.&lt;string&gt;, musclesUpdated: Array.&lt;string&gt;, exercisesLinked: number, links: number, unmapped: Array.&lt;string&gt;, missing: Array.&lt;string&gt;}&gt;</code>
Write the muscle map into a database: the muscles (adding `parent_id` to the record if it's missing), each mapped
exercise's links (replacing the ones it had), and the descriptions. Running it again changes nothing.

**Kind**: static constant of [<code>muscleMap</code>](#module_muscleMap)  
**Returns**: <code>Promise.&lt;{musclesAdded: Array.&lt;string&gt;, musclesUpdated: Array.&lt;string&gt;, exercisesLinked: number, links: number, unmapped: Array.&lt;string&gt;, missing: Array.&lt;string&gt;}&gt;</code> - unmapped: stored exercises with no entry in the map; missing: map entries with no stored exercise.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>function</code> | json-fs-query's query, configured for the database. |
| quote | <code>function</code> | json-fs-query's quote. |

<a name="module_muscleMap..U"></a>

### muscleMap~U
Short names used in the shares below.

**Kind**: inner constant of [<code>muscleMap</code>](#module_muscleMap)  
<a name="module_muscleMap..CORE"></a>

### muscleMap~CORE
The core share on lifts that need heavy bracing (erector spinae keeps a bigger share where it has one).

**Kind**: inner constant of [<code>muscleMap</code>](#module_muscleMap)  
<a name="module_muscleMap..pressTriceps"></a>

### muscleMap~pressTriceps(share) ⇒ <code>Object.&lt;string, number&gt;</code>
Triceps in a press, push-up or dip: the share goes to the lateral and medial heads, and the long head gets about 60%
of it (to the nearest 10).

**Kind**: inner method of [<code>muscleMap</code>](#module_muscleMap)  

| Param | Type |
| --- | --- |
| share | <code>number</code> | 

<a name="module_migrations"></a>

## migrations
Changes to the database's records, in order. Each one checks whether it has already run, so `migrate()` can be run
any time: on database/ by scripts/migrate.js, and on every test database (testDatabase.js), so tests always see
the current schema even before database/ has been migrated.


* [migrations](#module_migrations)
    * _static_
        * [.migrations](#module_migrations.migrations) : <code>Array.&lt;{name: string, applied: function(function()): Promise.&lt;boolean&gt;, up: function(function(), function()): Promise.&lt;Object&gt;}&gt;</code>
        * [.migrate](#module_migrations.migrate) ⇒ <code>Promise.&lt;Array.&lt;{name: string, result: Object}&gt;&gt;</code>
    * _inner_
        * [~fieldsOf(query, record)](#module_migrations..fieldsOf) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>

<a name="module_migrations.migrations"></a>

### migrations.migrations : <code>Array.&lt;{name: string, applied: function(function()): Promise.&lt;boolean&gt;, up: function(function(), function()): Promise.&lt;Object&gt;}&gt;</code>
**Kind**: static constant of [<code>migrations</code>](#module_migrations)  
<a name="module_migrations.migrate"></a>

### migrations.migrate ⇒ <code>Promise.&lt;Array.&lt;{name: string, result: Object}&gt;&gt;</code>
Run every migration that hasn't run yet, in order.

**Kind**: static constant of [<code>migrations</code>](#module_migrations)  
**Returns**: <code>Promise.&lt;Array.&lt;{name: string, result: Object}&gt;&gt;</code> - the migrations that ran, with what each reported  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>function</code> | json-fs-query's query, configured for the database |
| quote | <code>function</code> | json-fs-query's quote |

<a name="module_migrations..fieldsOf"></a>

### migrations~fieldsOf(query, record) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
The fields of a record.

**Kind**: inner method of [<code>migrations</code>](#module_migrations)  

| Param | Type |
| --- | --- |
| query | <code>function</code> | 
| record | <code>string</code> | 

<a name="logWorkout"></a>

## logWorkout
Log a new workout entry. The weight is stored as entered, in the unit the equipment shows.

**Kind**: global constant  

| Param | Description |
| --- | --- |
| exerciseId |  |
| weight | the amount, e.g. 67.5 (optional: bodyweight and holds have none) |
| unit | 'kg' or 'lbs' |
| seconds | a timed hold's length (optional) |
| sets |  |
| reps |  |
| note |  |
| date | defaults to today (the local date, see localDate), in the same 'YYYY-MM-DD' shape the rest of the data uses |
| order | where this entry falls among others logged the same day (defaults to first) |

<a name="updateWorkout"></a>

## updateWorkout
Update an existing workout entry - e.g. correcting the plan with what was actually done.

**Kind**: global constant  

| Param | Description |
| --- | --- |
| workoutId |  |
| changes | any subset of weight (with unit)/seconds/sets/reps/note to change; an empty weight clears it |

<a name="addExercise"></a>

## addExercise
Add a new exercise, with the muscles it works (primary/secondary, by whatever rank you give).

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| name |  |  |
| description |  |  |
| muscleAssignments | <code>Array.&lt;{muscleId: number, rank: number}&gt;</code> | one row per muscle this exercise works |

<a name="exercise"></a>

## exercise ⇒ <code>function</code>
A value that is the _id of the exercise with this name, once it's inserted: exercises' ids are generated on insert
(json-fs-query's `auto` replaces any _id given), so rows refer to them through this.

**Kind**: global constant  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 

<a name="seedRows"></a>

## seedRows
The rows every test database starts with: the app's original seed data (14 muscles, 3 exercises each linked to one
muscle, and 6 workouts on 2024-06-02 and 2024-06-05). Fixed here, so tests never depend on the real database/,
which changes with every workout logged.

**Kind**: global constant  
<a name="createTestDatabase"></a>

## createTestDatabase ⇒ <code>Promise.&lt;Object.&lt;string, Array.&lt;Object&gt;&gt;&gt;</code>
Build a test database at destination: every record the real database has, with the same fields and keys (read
from its record files, so a schema change reaches the tests, then migrated), holding only the given rows. Configures
json-fs-query to use it.

**Kind**: global constant  
**Returns**: <code>Promise.&lt;Object.&lt;string, Array.&lt;Object&gt;&gt;&gt;</code> - The inserted rows by record (with their generated ids).  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| destination | <code>string</code> |  | The folder to create the test database in. |
| [rows] | <code>Object.&lt;string, Array.&lt;Object&gt;&gt;</code> | <code>seedRows</code> | The rows to insert, by record, in an order that keeps the foreign keys valid. |
| [source] | <code>string</code> | <code>&quot;&#x27;database/&#x27;&quot;</code> | The real database whose schema is copied. |

<a name="createReads"></a>

## createReads ⇒ <code>Object</code>
The app's reads, given the json-fs-query `query` and `quote` to run them with: Node's (workoutQueries.js, for the
API server and the tests) or the browser build's (browserReads.js, for the page, which reads database/ from its own
origin over fetch()). Reads need no server; only writes do.

**Kind**: global constant  

| Param | Type |
| --- | --- |
| jsonFsQuery | <code>Object</code> | 


* [createReads](#createReads) ⇒ <code>Object</code>
    * [~quoteId(id)](#createReads..quoteId) ⇒ <code>string</code> \| <code>undefined</code> \| <code>null</code>
    * [~getMusclePriority(today)](#createReads..getMusclePriority)
    * [~getExercisesForMuscle(muscleId)](#createReads..getExercisesForMuscle)
    * [~getLastSession(exerciseId)](#createReads..getLastSession)

<a name="createReads..quoteId"></a>

### createReads~quoteId(id) ⇒ <code>string</code> \| <code>undefined</code> \| <code>null</code>
An id as a query value: quoted, since ids are strings and a generated one (a UUID such as
'aca3a0b4-5539-...') reads as subtraction when it isn't. A missing id stays missing, so the query still fails on it.

**Kind**: inner method of [<code>createReads</code>](#createReads)  

| Param |
| --- |
| id | 

<a name="createReads..getMusclePriority"></a>

### createReads~getMusclePriority(today)
Rank every muscle by how much it needs attention right now, from a real read of the database.

**Kind**: inner method of [<code>createReads</code>](#createReads)  

| Param | Description |
| --- | --- |
| today | injectable for testing; defaults to the real current time |

<a name="createReads..getExercisesForMuscle"></a>

### createReads~getExercisesForMuscle(muscleId)
Every exercise linked to a given muscle, via exercise_muscle, the biggest share of the work first.

**Kind**: inner method of [<code>createReads</code>](#createReads)  

| Param |
| --- |
| muscleId | 

<a name="createReads..getLastSession"></a>

### createReads~getLastSession(exerciseId)
The most recently logged workout for a given exercise, or null if it's never been logged.

**Kind**: inner method of [<code>createReads</code>](#createReads)  

| Param |
| --- |
| exerciseId | 

<a name="musclePriority"></a>

## musclePriority
Rank muscles by how much they need attention right now, from a real read of the database: every muscle (including
ones never worked at all), and every workout row with the muscles its exercise works.

Work is counted in weighted sets: a workout row's sets times the muscle's share of the exercise (rank / 100), so 3
sets of bench press give the mid and lower chest 3 and the front deltoid 1.5. A muscle counts as worked on a day
with at least WORKED_DAY_SETS weighted sets. It needs priority when it has recovered (RECOVERY_DAYS since it was
last worked, or never worked) and is still short of the weekly target in the last 7 days. Muscles needing priority
sort first, the biggest shortfall first, then the longest since worked.

A muscle split into regions (Pectorals: upper chest, mid and lower chest) is ranked by its regions, since exercises
link to those: the muscle itself isn't listed, and each region's name starts with the muscle's (`group` is the
muscle's name, for grouping).

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| muscles |  | every row from `read muscles` |
| workoutsWithMuscles |  | workout rows, each with `sets` (a row without it counts as 1 set) and a `.muscles` array: each muscle's `_id` and `rank` (0-100; a muscle without a rank counts as 100) |
| today |  | injectable for testing; defaults to the real current time (only its local date counts). Workouts dated after it are ignored |
| [options] | <code>Object</code> | weeklyTarget: weighted sets per muscle per week (default 10) |

<a name="localDate"></a>

## localDate
A date as 'YYYY-MM-DD' in the machine's own timezone - the shape every workout's date uses. Not
toISOString().slice(0, 10): that's the UTC date, which is already tomorrow in the evening anywhere
west of UTC (21:30 in Toronto is 01:30 UTC).

**Kind**: global constant  

| Param | Description |
| --- | --- |
| date | defaults to now |

<a name="workout"></a>

## workout ⇒ <code>DomItem</code>
Generates a table for a workout plan.

**Kind**: global constant  
<a name="musclePriorityList"></a>

## musclePriorityList ⇒ <code>Object.&lt;DomItem&gt;</code>
Generates a table ranking muscles by how much they need attention right now.

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| priorityRows | <code>Array</code> | musclePriority()'s shape: [{ muscleId, name, daysSinceLastWorked, weeklySets, weeklyTarget, needsPriority }] |

<a name="logWorkoutForm"></a>

## logWorkoutForm ⇒ <code>Object</code>
Builds the log-workout form's DOM structure. No event wiring here - see exercisePicker.js's
own note on why that has to happen after this is attached into the real document and rendered.
The weight is entered in the unit the equipment shows (the unit picker starts on the exercise's last unit).

**Kind**: global constant  
<a name="readFormValues"></a>

## readFormValues
Reads the form's current field values, independent of which button triggered it. A hold's time ('0:45', '45s')
becomes seconds.

**Kind**: global constant  

| Param | Type |
| --- | --- |
| form | <code>Object</code> | 

<a name="wireLogWorkoutFormEvents"></a>

## wireLogWorkoutFormEvents
Wires the form's submit and update buttons - see logWorkoutForm's own note on timing.

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| form | <code>Object</code> |  |
| onSubmit | <code>function</code> | ({ weight, unit, seconds, sets, reps, note, date }) => void, logs a brand new entry |
| onUpdate | <code>function</code> | ({ weight, unit, seconds, sets, reps, note, date }) => void, corrects the most recently shown entry |

<a name="formatLastSession"></a>

## formatLastSession ⇒ <code>string</code>
A session in one line, its weight in the viewer's unit and, when the equipment's unit differs, the weight as
entered in brackets: "Last time: 81.6 kg (180 lbs), 3x10 on 2024-06-05". A hold shows its time instead.

**Kind**: global constant  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| session | <code>Object</code> \| <code>null</code> |  | getLastSession()'s shape, or null if never logged |
| [preferredUnit] | <code>string</code> | <code>&quot;&#x27;kg&#x27;&quot;</code> | 'kg' or 'lbs' |

<a name="lastSessionDisplay"></a>

## lastSessionDisplay ⇒ <code>DomItem</code>
**Kind**: global constant  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| session | <code>Object</code> \| <code>null</code> |  | getLastSession()'s shape, or null if never logged |
| [preferredUnit] | <code>string</code> | <code>&quot;&#x27;kg&#x27;&quot;</code> | 'kg' or 'lbs' |

<a name="exercisePicker"></a>

## exercisePicker ⇒ <code>Object</code>
Builds the muscle -> exercise picker's DOM structure. No event wiring here - fullAddEventListener
needs a complete parentItem chain up to the real document root (it throws otherwise), which a
freshly-built, not-yet-attached DomItem doesn't have yet. Call wireExercisePickerEvents once this
is attached into the real document and rendered.

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| priorityRows | <code>Array</code> | musclePriority()'s shape, ordered by priority - becomes the muscle dropdown's options, top priority first |

<a name="wireExercisePickerEvents"></a>

## wireExercisePickerEvents
Wires the picker's change events, once it's attached into the real document and rendered -
see exercisePicker's own note on why this can't happen at construction time.

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| picker | <code>Object</code> |  |
| onMuscleChange | <code>function</code> | (muscleId: string) => void |
| onExerciseChange | <code>function</code> | (exerciseId: string) => void |

<a name="detail"></a>

## detail ⇒ <code>DomItem</code>
Generates a menu with the provided index as the currently selected item.

**Kind**: global constant  

| Param | Type |
| --- | --- |
| currentIndex | <code>number</code> | 

<a name="addExerciseForm"></a>

## addExerciseForm ⇒ <code>Object</code>
Builds the add-exercise form's DOM structure. No event wiring here - see exercisePicker.js's
own note on why that has to happen after this is attached into the real document and rendered.
Primary and secondary are two separate multi-selects (rather than one picker with a per-muscle
rank) - a real exercise's muscles split cleanly into those two buckets, and a plain multi-select
needs no dynamic add/remove row UI to support picking several of each.

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| muscles | <code>Array</code> | musclePriority()'s shape (every real muscle, not just priority ones) - becomes both selects' options |

<a name="wireAddExerciseFormEvents"></a>

## wireAddExerciseFormEvents
Wires the form's submit button - see addExerciseForm's own note on timing.

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| form | <code>Object</code> |  |
| onSubmit | <code>function</code> | ({ name, description, primaryMuscleIds, secondaryMuscleIds }) => void |

<a name="responsiveTable"></a>

## responsiveTable ⇒ <code>Object.&lt;DomItem&gt;</code>
Generates a menu with the provided index as the currently selected item.

**Kind**: global constant  

| Param | Type |
| --- | --- |
| tableRows | <code>Array</code> | 
| tableHeadings | <code>Array</code> | 
| tableClass | <code>string</code> | 

<a name="weightAssignments"></a>

## weightAssignments(weight, unit, [clear]) ⇒ <code>Array.&lt;string&gt;</code>
A weight as query assignments: the amount as decimal text (json-fs-query has no decimal type) and its unit. An
empty or missing amount assigns nothing, unless `clear` is set (an update clearing the weight).

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| weight | <code>number</code> \| <code>string</code> \| <code>undefined</code> |  | 
| unit | <code>string</code> |  | 
| [clear] | <code>boolean</code> | <code>false</code> | 

<a name="dayNumber"></a>

## dayNumber(date)
A 'YYYY-MM-DD' date as a whole day number, so two dates are compared as calendar days, never as moments: a
workout's date has no time of day, and new Date('YYYY-MM-DD') is midnight UTC, which in the evening west of UTC
is already more than a day before the local "now" (21:30 in Toronto counted yesterday's workout as 2 days ago).

**Kind**: global function  

| Param |
| --- |
| date | 

<a name="PlanExercise"></a>

## PlanExercise : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| exerciseId | <code>string</code> | 
| equipmentId | <code>string</code> \| <code>null</code> | 
| sets | <code>number</code> | 
| reps | <code>number</code> | 
| weight | <code>Object</code> \| <code>null</code> | 

<a name="Plan"></a>

## Plan : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| summary | <code>string</code> | 
| weeks | <code>Array.&lt;{week: number, days: Array.&lt;{dayOfWeek: number, exercises: Array.&lt;PlanExercise&gt;}&gt;}&gt;</code> | 

<a name="Goal"></a>

## Goal : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| exerciseId | <code>string</code> | v1: one strength goal on one exercise |
| weight | <code>Object</code> | the weight to lift |
| reps | <code>number</code> | for this many reps |
| weeks | <code>number</code> | 4 to 12 |

<a name="ContextExercise"></a>

## ContextExercise : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> |  |
| name | <code>string</code> |  |
| equipment | <code>Array.&lt;string&gt;</code> | equipment ids it needs, all in the gym |
| loadedEquipment | <code>string</code> \| <code>null</code> | the one that takes the weight, or null |
| muscles | <code>Array.&lt;{muscleId: string, name: string, share: number}&gt;</code> | share of the work, 0-100 |
| last | <code>Object</code> \| <code>null</code> |  |
| estimatedMax | <code>Object</code> \| <code>null</code> | in the profile's unit |

<a name="PlanContext"></a>

## PlanContext : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| today | <code>string</code> | 'YYYY-MM-DD' |
| goal | <code>Object</code> | the goal with its exercise's name, its estimated max now and the max the target implies |
| profile | <code>GymProfile</code> |  |
| exercises | [<code>Array.&lt;ContextExercise&gt;</code>](#ContextExercise) |  |
| musclePriority | <code>Array.&lt;Object&gt;</code> |  |

