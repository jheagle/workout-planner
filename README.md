# workout-planner
Plan daily and weekly workouts based on goals and muscle groups.
## Constants

<dl>
<dt><a href="#getMusclePriority">getMusclePriority</a></dt>
<dd><p>Rank every muscle by how much it needs attention right now, from a real read of the database.</p>
</dd>
<dt><a href="#getExercisesForMuscle">getExercisesForMuscle</a></dt>
<dd><p>Every exercise linked to a given muscle, via exercise_muscle.</p>
</dd>
<dt><a href="#getLastSession">getLastSession</a></dt>
<dd><p>The most recently logged workout for a given exercise, or null if it&#39;s never been logged.</p>
</dd>
<dt><a href="#logWorkout">logWorkout</a></dt>
<dd><p>Log a new workout entry.</p>
</dd>
<dt><a href="#updateWorkout">updateWorkout</a></dt>
<dd><p>Update an existing workout entry - e.g. correcting the plan with what was actually done.</p>
</dd>
<dt><a href="#addExercise">addExercise</a></dt>
<dd><p>Add a new exercise, with the muscles it works (primary/secondary, by whatever rank you give).</p>
</dd>
<dt><a href="#musclePriority">musclePriority</a></dt>
<dd><p>Rank muscles by how much they need attention right now, from a real read of the database:
every muscle (including ones never worked at all), and every workout row with its muscles
already joined on (see workout()/musclePriority.test.js for the exact query shape this expects).
A muscle needs priority once it&#39;s past its recovery window, or hasn&#39;t been worked often enough
this week yet - whichever muscle has gone longest without being worked sorts first.</p>
</dd>
<dt><a href="#copyDatabase">copyDatabase</a></dt>
<dd><p>Copy the real database/ directory into an isolated test directory, so insert/update tests have
real seed data to work with without ever touching the actual database/ this app runs against.</p>
</dd>
<dt><a href="#workout">workout</a> ⇒ <code>DomItem</code></dt>
<dd><p>Generates a table for a workout plan.</p>
</dd>
<dt><a href="#musclePriorityList">musclePriorityList</a> ⇒ <code>Object.&lt;DomItem&gt;</code></dt>
<dd><p>Generates a table ranking muscles by how much they need attention right now.</p>
</dd>
<dt><a href="#logWorkoutForm">logWorkoutForm</a> ⇒ <code>Object</code></dt>
<dd><p>Builds the log-workout form&#39;s DOM structure. No event wiring here - see exercisePicker.js&#39;s
own note on why that has to happen after this is attached into the real document and rendered.</p>
</dd>
<dt><a href="#readFormValues">readFormValues</a></dt>
<dd><p>Reads the form&#39;s current field values, independent of which button triggered it.</p>
</dd>
<dt><a href="#wireLogWorkoutFormEvents">wireLogWorkoutFormEvents</a></dt>
<dd><p>Wires the form&#39;s submit and update buttons - see logWorkoutForm&#39;s own note on timing.</p>
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
<dt><a href="#text">text</a> ⇒ <code>DomItem</code></dt>
<dd><p>Create the template of a DomItem</p>
</dd>
<dt><a href="#node">node</a> ⇒ <code>DomItem</code></dt>
<dd><p>Create the template of a DomItem</p>
</dd>
<dt><a href="#navigation">navigation</a> ⇒ <code>DomItem</code></dt>
<dd><p>Create a nav DomItem</p>
</dd>
<dt><a href="#element">element</a> ⇒ <code>DomItem</code></dt>
<dd><p>Create the template of a DomItem</p>
</dd>
<dt><a href="#responsiveTable">responsiveTable</a> ⇒ <code>Object.&lt;DomItem&gt;</code></dt>
<dd><p>Generates a menu with the provided index as the currently selected item.</p>
</dd>
</dl>

<a name="getMusclePriority"></a>

## getMusclePriority
Rank every muscle by how much it needs attention right now, from a real read of the database.

**Kind**: global constant  

| Param | Description |
| --- | --- |
| today | injectable for testing; defaults to the real current time |

<a name="getExercisesForMuscle"></a>

## getExercisesForMuscle
Every exercise linked to a given muscle, via exercise_muscle.

**Kind**: global constant  

| Param |
| --- |
| muscleId | 

<a name="getLastSession"></a>

## getLastSession
The most recently logged workout for a given exercise, or null if it's never been logged.

**Kind**: global constant  

| Param |
| --- |
| exerciseId | 

<a name="logWorkout"></a>

## logWorkout
Log a new workout entry.

**Kind**: global constant  

| Param | Description |
| --- | --- |
| exerciseId |  |
| weightEffort |  |
| sets |  |
| reps |  |
| note |  |
| date | defaults to today, in the same 'YYYY-MM-DD' shape the rest of the data uses |
| order | where this entry falls among others logged the same day (defaults to first) |

<a name="updateWorkout"></a>

## updateWorkout
Update an existing workout entry - e.g. correcting the plan with what was actually done.

**Kind**: global constant  

| Param | Description |
| --- | --- |
| workoutId |  |
| changes | any subset of weightEffort/sets/reps/note to change |

<a name="addExercise"></a>

## addExercise
Add a new exercise, with the muscles it works (primary/secondary, by whatever rank you give).

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| name |  |  |
| description |  |  |
| muscleAssignments | <code>Array.&lt;{muscleId: number, rank: number}&gt;</code> | one row per muscle this exercise works |

<a name="musclePriority"></a>

## musclePriority
Rank muscles by how much they need attention right now, from a real read of the database:every muscle (including ones never worked at all), and every workout row with its musclesalready joined on (see workout()/musclePriority.test.js for the exact query shape this expects).A muscle needs priority once it's past its recovery window, or hasn't been worked often enoughthis week yet - whichever muscle has gone longest without being worked sorts first.

**Kind**: global constant  

| Param | Description |
| --- | --- |
| muscles | every row from `read muscles` |
| workoutsWithMuscles | every row from the workouts-joined-to-muscles query, each carrying a `.muscles` array (the muscles that workout's exercise worked) |
| today | injectable for testing; defaults to the real current time |

<a name="copyDatabase"></a>

## copyDatabase
Copy the real database/ directory into an isolated test directory, so insert/update tests havereal seed data to work with without ever touching the actual database/ this app runs against.

**Kind**: global constant  

| Param |
| --- |
| destination | 

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
| priorityRows | <code>Array</code> | musclePriority()'s shape: [{ muscleId, name, daysSinceLastWorked, timesWorkedThisWeek, needsPriority }] |

<a name="logWorkoutForm"></a>

## logWorkoutForm ⇒ <code>Object</code>
Builds the log-workout form's DOM structure. No event wiring here - see exercisePicker.js'sown note on why that has to happen after this is attached into the real document and rendered.

**Kind**: global constant  
<a name="readFormValues"></a>

## readFormValues
Reads the form's current field values, independent of which button triggered it.

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
| onSubmit | <code>function</code> | ({ weightEffort, sets, reps, note, date }) => void, logs a brand new entry |
| onUpdate | <code>function</code> | ({ weightEffort, sets, reps, note, date }) => void, corrects the most recently shown entry |

<a name="lastSessionDisplay"></a>

## lastSessionDisplay ⇒ <code>DomItem</code>
**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| session | <code>Object</code> \| <code>null</code> | getLastSession()'s shape, or null if never logged |

<a name="exercisePicker"></a>

## exercisePicker ⇒ <code>Object</code>
Builds the muscle -> exercise picker's DOM structure. No event wiring here - fullAddEventListenerneeds a complete parentItem chain up to the real document root (it throws otherwise), which afreshly-built, not-yet-attached DomItem doesn't have yet. Call wireExercisePickerEvents once thisis attached into the real document and rendered.

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| priorityRows | <code>Array</code> | musclePriority()'s shape, ordered by priority - becomes the muscle dropdown's options, top priority first |

<a name="wireExercisePickerEvents"></a>

## wireExercisePickerEvents
Wires the picker's change events, once it's attached into the real document and rendered -see exercisePicker's own note on why this can't happen at construction time.

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
Builds the add-exercise form's DOM structure. No event wiring here - see exercisePicker.js'sown note on why that has to happen after this is attached into the real document and rendered.Primary and secondary are two separate multi-selects (rather than one picker with a per-musclerank) - a real exercise's muscles split cleanly into those two buckets, and a plain multi-selectneeds no dynamic add/remove row UI to support picking several of each.

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

<a name="text"></a>

## text ⇒ <code>DomItem</code>
Create the template of a DomItem

**Kind**: global constant  

| Param | Type |
| --- | --- |
| nodeValue | <code>string</code> | 

<a name="node"></a>

## node ⇒ <code>DomItem</code>
Create the template of a DomItem

**Kind**: global constant  

| Param | Type | Default |
| --- | --- | --- |
| nodeName | <code>string</code> |  | 
| nodeValue | <code>string</code> |  | 
| [children] | <code>array</code> | <code>[]</code> | 
| [attributes] | <code>object</code> | <code>{}</code> | 

<a name="navigation"></a>

## navigation ⇒ <code>DomItem</code>
Create a nav DomItem

**Kind**: global constant  

| Param | Type | Default |
| --- | --- | --- |
| [children] | <code>array</code> | <code>[]</code> | 
| [className] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | 
| [attributes] | <code>object</code> | <code>{}</code> | 

<a name="element"></a>

## element ⇒ <code>DomItem</code>
Create the template of a DomItem

**Kind**: global constant  

| Param | Type | Default |
| --- | --- | --- |
| nodeName | <code>string</code> |  | 
| [children] | <code>array</code> | <code>[]</code> | 
| [className] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | 
| [attributes] | <code>object</code> | <code>{}</code> | 

<a name="responsiveTable"></a>

## responsiveTable ⇒ <code>Object.&lt;DomItem&gt;</code>
Generates a menu with the provided index as the currently selected item.

**Kind**: global constant  

| Param | Type |
| --- | --- |
| tableRows | <code>Array</code> | 
| tableHeadings | <code>Array</code> | 
| tableClass | <code>string</code> | 

