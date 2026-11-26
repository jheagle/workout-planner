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

