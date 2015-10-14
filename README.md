# improved-tables

This JavaScript library allows the dynamic display of tabular data. You can programatically create the table structure and add row with functions. It was originally designed as a search results box.

The following HTML is necessary to have
```html
  <table id="my-grid-table">
    <thead>
      <tr>
        <th></th>
        <th></th>
        <th></th>
        <!-- The number of <th>'must match the number of expected columns -->
      </tr>
    </thead>
    <tbody>
    </tbody>
  </table>
```
Some notes about this: The id of the table is used as a parameter in the javascript object constructor. It should allow you to have multiple objects active at once without conflicting.
<strong>The number of written th's must be the same as the number of expected columns.</strong>

To go along with the HTML, we have the following javascript

To initialize, we create an array of objects returned by <code>gridTableMakeCol</code>.
This object is an abstraction of one of our columns. Its parameters are the internal reference name, the displayed column name, and the type of data that will be displayed (this affects sorting). Once we've created the array, we simply construct a new GridTable.

```js
    //INITIALIZATION
    var searchGridCols = [];
    searchGridCols[0] = gridTableMakeCol('colItemCode', 'Item Code', 'string');
    searchGridCols[1] = gridTableMakeCol('colItemName', 'Item Name', 'string');
    searchGridCols[2] = gridTableMakeCol('colPrice', 'Price', 'number')

    var searchGrid = new GridTable('#search-grid-table', searchGridCols);
```

Once our searchGrid has been constructed, I've made an array with some sample data. Once the array is constructed, you can just call <code>addRow</code> to insert the data.

Finally we call <code>renderRows</code> to actually show our changes. Note: <code>renderRows</code> should be used whenever new rows are added.

    //SAMPLE DATA
    var searchData = [
      {colItemCode: '1', colItemName: 'Test Item', colPrice: 35},
      {colItemCode: 'FJ48', colItemName: 'Foo Bar', colPrice: 322},
      {colItemCode: 'BAR', colItemName: 'Fizz', colPrice: 0}
    ];
    for (i in searchData) {
      searchGrid.addRow(searchData[i]);
    }
    searchGrid.renderRows();
