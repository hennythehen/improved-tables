function gridTableMakeCol(refName, displayTitle, dataType) {
  return {
    refName: refName,
    displayTitle: displayTitle,
    dataType: dataType
  };
}

function GridTable(tableSelector, columnsArr) {

  this.selectedRowId;

  this.sortStatus = {};

  this.tableNode = tableSelector;

  this.columnRefNames = Array();

  //auto increment id possibly to be used internally.
  this.internalIdIterator = 0;

  this.rowsArr = Array();

  /*CONSTRUCTOR*/
  var tHeaderRow = $(tableSelector).children('thead').find('tr').eq(0);
  for(var i = 0; i < columnsArr.length; i += 1) {
    var thNode = $(tHeaderRow).find('th').eq(i);

    thNode.prop('id', 'impt-' + columnsArr[i].refName);

    thNode.html(columnsArr[i].displayTitle);

    this.columnRefNames[i] = columnsArr[i].refName;

    //sets the sort array to a default null status.
    //most importantly, it's creating the object's properties to allow for referential multi-sorting
    this.sortStatus[columnsArr[i].refName] = null;
  }
  /*END CONSTRUCTOR*/

  this.addRow = function(dataObj, externalId) {
    this.internalIdIterator += 1;

    var row = {};
    // var dataArr = Array();

    row['externalId'] = externalId !== undefined ? externalId : '';
    row['internalId'] = this.internalIdIterator;
    for(var i = 0; i < this.columnRefNames.length; i += 1) {
      if( typeof(dataObj[this.columnRefNames[i]]) !== 'undefined') {
        row[this.columnRefNames[i]] = dataObj[this.columnRefNames[i]];
        // dataArr.push(dataObj[this.columnRefNames[i]]);
      }
      else {
        row[this.columnRefNames[i]] = ''; //i wonder if this should be null
        // dataArr.push('');
      }
    }

    row.rawData = dataObj;
    this.rowsArr.push(row);
  }

  //to alternate between asc and desc sorting, leave the direction parameter blank
  this.sortOnColumn = function(refName, direction) {
    //direction specified
    if(typeof(direction) !== 'undefined') {
      thisla.sortStatus[refName] = direction;
    } else if(typeof(direction) === 'undefined') {
      //alternate between statuses or use desc as default
      if(this.sortStatus[refName] === 'asc') {
        this.sortStatus[refName] = 'desc';
      }
      else if (this.sortStatus[refName] === 'desc') {
        this.sortStatus[refName] = 'asc';
      }
      else {
        this.sortStatus[refName] = 'desc';
      }
    }

    direction = this.sortStatus[refName];

    var dataType;

    for(var i = 0; i < columnsArr.length; i += 1) {
      if(columnsArr[i].refName === refName) {
        dataType = columnsArr[i].dataType;
        break;
      }
    }

    var compareFunc;

    switch(dataType) {
      case 'number':
        compareFunc = function(a, b) {
          if(direction === 'asc') {
            return parseFloat(a[refName]) - parseFloat(b[refName]);
          }
          if(direction === 'desc') {
            return parseFloat(b[refName]) - parseFloat(a[refName]);
          }
        }
        break;
      case 'string':
        compareFunc = function(a, b) {
          if(direction === 'asc') {
            return a[refName].toLowerCase() < b[refName].toLowerCase() ? -1 : 1;
          }
          if(direction === 'desc') {
            return a[refName].toLowerCase() > b[refName].toLowerCase() ? -1 : 1;
          }
        }
        break;
      default:
        compareFunc = function(a, b) {
          if(direction === 'asc') {
            return a[refName] < b[refName] ? -1 : 1;
          }
          if(direction === 'desc') {
            return a[refName] > b[refName] ? -1 : 1;
          }
        }
        break;
    }

    this.rowsArr.sort(compareFunc);
  }


  //trCallback is sent to the row HTML renderer.
  //if for some reason you needed to add a specific class or something to a row,
  //you would do it with this
  this.renderRows = function(trCallback) {
    //modify the number of <tr>'s in the DOM to reflect the current number of rows
    var initialNumDisplayedRows = $(this.tableNode).children('tbody').find('tr').length;
    //remove extra rows
    if(initialNumDisplayedRows > this.rowsArr.length) {
      var rowsToRemove = initialNumDisplayedRows - this.rowsArr.length;
      for(i = 0; i < rowsToRemove; i++) {
        // -1 to account for the 0-based index of the jquery eq() function
        var updatedLastElem = initialNumDisplayedRows - i - 1;
        $(this.tableNode).children('tbody').find('tr').eq(updatedLastElem).remove();
      }
    }
    //add needed rows
    if(initialNumDisplayedRows < this.rowsArr.length) {
      var diff = this.rowsArr.length - initialNumDisplayedRows;
      for(i = 0; i < diff; i++) {
        var updatedLastElem = initialNumDisplayedRows + i;
        var rowToBeDrawn = this.rowsArr[this.rowsArr.length - diff + i]
        $(this.tableNode).find('tbody').append(this.getNewRowHtml(rowToBeDrawn, trCallback));
      }
    }

    //does a blanket rewrite of each row in the table.
    //for maximum effeciency, could have an id in the DOM row that could be checked against the data row
    // length - 1 to account for the first <tr> acting as the header
    var currentNumDisplayedRows = $(this.tableNode).children('tbody').find('tr').length;

    //temporarily removes selected class from a row. it will be reapplied to the same data, but a different row
    var selectedId = $(this.tableNode).children('tbody').find('tr.selected').data('id');

    $(this.tableNode).children().find('tr.selected').removeClass('selected');
    for(var i = 0; i < currentNumDisplayedRows; i += 1) {
      var trNode = $(this.tableNode).children('tbody').find('tr').eq(i);
      $(trNode).data('id', this.rowsArr[i].internalId);

      if ($(trNode).data('id') === selectedId && typeof(selectedId) !== 'undefined') {
        $(trNode).addClass('selected');
        this.selectedRowId = $(trNode).data('id');
      }
      for(var j = 0; j < this.columnRefNames.length; j += 1) {
        $(trNode).children('td').eq(j).html(this.rowsArr[i][this.columnRefNames[j]]);
        //set the width of the header and body cells.
        //an interesting issue: the size of cells depends on content. The size can
        //only increase from the initial size.
        var columnWidth = $(trNode).children('td').eq(j).width();
        var headerWidth = $(this.tableNode).find('th').eq(j).width();
        if(columnWidth > headerWidth) {
          $(this.tableNode).children('thead').find('th').eq(j).width(columnWidth);
        }
        else {
          $(trNode).children('td').eq(j).width(headerWidth);
        }
      }

      //need to programatically set the width of the thead and tbody columns
    }
  }

  this.getNewRowHtml = function(row, trCallback) {
    var trInsert = '';
    if(typeof(rowCallback) === 'function') {
      trInsert = trCallback();
    }
    var html = '<tr ' + trInsert + ' >';
    for(var i = 0; i < this.columnRefNames.length; i++) {
      html += '<td>' + row[this.columnRefNames[i]] + '</td>';
    }
    html += '</tr>';
    return html;
  }

  this.setSelected = function(row) {
    row.isSelected = true;
  }

  this.setUnselected = function(row) {
    row.isSelected = false;
  }

  this.clearRows = function() {
    $(this.tableNode).children().find('tr.selected').removeClass('selected');
    this.internalIdIterator = 0;
    this.selectedRowId = undefined;
    this.rowsArr = Array();
  }

  this.getSelectedRowData = function(row) {
    if (typeof(row) === 'undefined') {
      for(var i = 0; i < this.rowsArr.length; i += 1) {
        if(this.rowsArr[i].internalId === this.selectedRowId) {
          row = this.rowsArr[i];
          break;
        }
      }
    }
    var returningData = {};
    for (var i in this.columnRefNames) {
      var prop = this.columnRefNames[i];
      returningData[prop] = row[prop];
    }
    returningData['externalId'] = row.externalId;
    returningData.rawData = row.rawData;
    return returningData;
  }

  //EVENT HANDLERS

  //handler for clicking <th>'s and sorting the respective column
  this.rowSortOnColSelectionHandler = (function(grid) {
    $(tableSelector).children('thead').find('th').click(function() {
      var idStr = $(this).prop('id');
      idStr = idStr.substring(5);
      grid.sortOnColumn(idStr);
      grid.renderRows();
    })
  })(this);

  this.selectRowHandler = (function(grid) {
    $(tableSelector).children('tbody').focus();

    $(tableSelector).children('tbody').delegate('tr', 'click', function() {
      var initSelectedNode = $(tableSelector).children('tbody').find('tr.selected');
      $(initSelectedNode).removeClass('selected');
      $(this).addClass('selected');
      grid.selectedRowId = $(this).data('id');
    })
  })(this);

  this.keyHandlers = (function(grid) {
    $(tableSelector).keydown(function(e) {
      if ( !$(tableSelector).children('tbody').find('tr').hasClass('selected') ) {
        $(tableSelector).children('tbody').find('tr').first().addClass('selected');
        grid.selectedRowId = $(tableSelector).children('tbody').find('tr.selected').data('id');
        return;
      }
      //down arrow
      if(e.keyCode === 40) {
        e.preventDefault();

        var initSelectedNode = $(tableSelector).children('tbody').find('tr.selected');
        if (initSelectedNode === undefined) {
          $(tableSelector).children('tbody:first-child').addClass('selected');
          grid.selectedRowId = $(tableSelector).children('tbody:first-child').data('id');
        }

        if ($(initSelectedNode).next().is('tr')) {
          var nextNode = $(initSelectedNode).next();
          $(initSelectedNode).removeClass('selected');
          $(nextNode).addClass('selected');
          grid.selectedRowId = $(nextNode).data('id');
        }
      }
      //up arrow
      if(e.keyCode === 38) {
        e.preventDefault();
        var initSelectedNode = $(tableSelector).children('tbody').find('tr.selected');
        if ($(initSelectedNode).prev().is('tr')) {
          var previousNode = $(initSelectedNode).prev();
          $(initSelectedNode).removeClass('selected');
          $(previousNode).addClass('selected');
          grid.selectedRowId = $(previousNode).data('id');
        }
      }
      if ((e.keyCode === 40 || e.keyCode === 38) && grid.selectedRowId !== undefined) {

        var tbodyNode = $(tableSelector).children('tbody');
        var trHeight = $(tableSelector).find('tr.selected').height();
        var tbodyBottom = $(tbodyNode).height();
        var offsetFromTop = $('tr.selected').position().top;
        var scroll = $(tbodyNode).scrollTop();

        if (offsetFromTop < 0) {
          $(tbodyNode).scrollTop(offsetFromTop + scroll);
        }

        if (offsetFromTop + trHeight > tbodyBottom) {
          $(tbodyNode).scrollTop(offsetFromTop + scroll + trHeight - tbodyBottom);
        }
      }
    });
  })(this);
}
