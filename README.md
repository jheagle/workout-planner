# workout-planner
Plan daily and weekly workouts based on goals and muscle groups.
## Constants

<dl>
<dt><a href="#workout">workout</a> ⇒ <code>DomItem</code></dt>
<dd><p>Generates a menu with the provided index as the currently selected item.</p>
</dd>
<dt><a href="#pageNavigation">pageNavigation</a> ⇒ <code>DomItem</code></dt>
<dd><p>Generates a menu with the provided index as the currently selected item.</p>
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
<dt><a href="#menu">menu</a> ⇒ <code>DomItem</code></dt>
<dd><p>Generates a menu with the provided index as the currently selected item.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#menuItem">menuItem</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="workout"></a>

## workout ⇒ <code>DomItem</code>
Generates a menu with the provided index as the currently selected item.

**Kind**: global constant  

| Param | Type |
| --- | --- |
| currentIndex | <code>number</code> | 

<a name="pageNavigation"></a>

## pageNavigation ⇒ <code>DomItem</code>
Generates a menu with the provided index as the currently selected item.

**Kind**: global constant  

| Param | Type |
| --- | --- |
| currentIndex | <code>number</code> | 

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

<a name="menu"></a>

## menu ⇒ <code>DomItem</code>
Generates a menu with the provided index as the currently selected item.

**Kind**: global constant  

| Param | Type |
| --- | --- |
| menuItems | [<code>Array.&lt;menuItem&gt;</code>](#menuItem) | 
| menuClass | <code>string</code> | 

<a name="menuItem"></a>

## menuItem : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| link | <code>string</code> | 
| text | <code>string</code> | 
| className | <code>string</code> | 

