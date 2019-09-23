/**
 * jsTrack: web-based Tracker (https://physlets.org/tracker/). Get position data from objects in a video.
 * Copyright (C) 2018 Luca Demian
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * Contact:
 * 
 * Luca Demian
 * jstrack.luca@gmail.com
 * 
 */

class Table
{
    constructor(track, columns)
    {
        this.track = track;
        this.columns = columns;
        this.data = [];
        this.tableData = [];
        let columnArray = [];
        for(var title in columns)
        {
            columnArray.push({
                title: title + "(" + columns[title] + ")",
                type: "text"
            });
        }
        this.settings = {
            columns: columnArray
        };
    }
    makeActive()
    {
        let settings = this.settings;
        let data = this.tableData;
        this.track.project.handsOnTable.updateSettings(settings);
        if(data.length > 0)
            this.track.project.handsOnTable.loadData(data);
        else
            this.track.project.handsOnTable.loadData([null]);
    }
    newCols(columns)
    {
        this.columns = columns;
        let columnArray = [];
        for(var title in columns)
        {
            columnArray.push({
                title: title + "(" + columns[title] + ")",
                type: "text"
            });
        }
        this.settings.columns = columnArray;
        this.track.project.handsOnTable.updateSettings(this.settings);
    }
    newData(data, update=true, replace=true)
    {
        if(replace)
        {
            this.tableData = [];
            this.data = [];
        }
        for(var i=0; i < data.length; i++)
        {
            let tempRow = [];
            for(var column in this.columns)
            {
                if(data[i][column] !== undefined)
                {
                    tempRow.push(data[i][column]);
                }
                else
                {
                    tempRow.push(null);
                }
            }
            this.tableData.push(tempRow);
            this.data.push(data[i]);
        }
        this.sort();

        if(replace)
            this.track.project.handsOnTable.updateSettings({"data": []});
        if(update)
            this.track.project.handsOnTable.loadData(this.tableData);
    }
    addColumn(newColumns)
    {
        for(var title in newColumns)
        {
            if(this.columns[title] === undefined)
            {
                this.columns[title] = newColumns[title];

                let tempData = [];
                for(var i=0; i < this.data.length; i++)
                {
                    let tempRow = [];
                    for(var column in this.columns)
                    {
                        if(this.data[i][column] !== undefined)
                        {
                            tempRow.push(this.data[i][column]);
                        }
                        else
                        {
                            tempRow.push(null);
                        }
                    }
                    tempData.push(tempRow);
                }
                this.tableData = tempData;
                this.sort();

                this.settings.columns.push({
                    title: title + "(" + newColumns[title] + ")",
                    type: "text"
                });
                this.makeActive();
            }
        }
    }
    addRow(row, update=false)
    {
        let tempRow = [];
        for(var column in this.columns)
        {
            if(row[column] !== undefined)
            {
                tempRow.push(row[column]);
            }
            else
            {
                tempRow.push(null);
            }
        }
        this.data.push(row);
        this.tableData.push(tempRow);
        this.sort();

        if(update)
            this.track.project.handsOnTable.loadData(this.tableData);
    }
    sort(index=0)
    {
        if(typeof index == "number")
        {
            this.tableData.sort(function(a, b){
                if(a[index] < b[index])
                {
                    return -1;
                }
                else if(a[index] > b[index])
                {
                    return 1;
                }
                else
                {
                    return 0;
                }
            });
        }
        else
        {
            this.data.sort(function(a, b){
                if(a[index] < b[index])
                {
                    return -1;
                }
                else if(a[index] > b[index])
                {
                    return 1;
                }
                else
                {
                    return 0;
                }
            });
        }
    }
}