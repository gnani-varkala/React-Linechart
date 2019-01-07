import React, { Component } from 'react';
import './App.css';
import LineChart from 'react-linechart';
import '../node_modules/react-linechart/dist/styles.css';

var that;
class App extends Component {
  constructor(props)
    {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
          data: [],
          isDataPresent: false,
          isFormatCorrect: true
        }
        that = this;
    }

    //Triggers this event whenever there is change in file input.
    handleChange(selectorFiles) {
      if(selectorFiles.length === 0) {
        return null;
      }
      let fileReader = new FileReader();
      let isFormatCorrect = '.csv' !== (selectorFiles[0].name).substring((selectorFiles[0].name).lastIndexOf('.'));
      if(isFormatCorrect){
        this.setState({
          isDataPresent: false,
          isFormatCorrect: false
        });
      }
      else{
        fileReader.onload = (function(f) {
          return function(e) {
            //Calls csvJson function to convert csv text intlo json format
            let fileJson = that.csvJSON(e.target.result);
            //Prepares the data in the format that is feed to line chart.
            let graphData = that.prepareGraphData(fileJson);
            //updates the state values.
            that.setState({data: graphData, isDataPresent : true, isFormatCorrect : true});
          };
        })(selectorFiles[0]);
  
        fileReader.readAsText(selectorFiles[0]);
      }
      
    }

    
    prepareGraphData(jsonData){
      var colorCode = ["red","green","yellow","aqua"];
      let graphData = [];
      for(let i=0; i<jsonData.length; i++){
        let obj = {};
        let points = this.sortByKey(jsonData[i].points , "x");
        
        obj["color"] = colorCode[i];
        obj["points"] = points;
        obj["name"] = jsonData[i].SERIES;
        
        graphData.push(obj);
      }
      
      return graphData;
    }

    sortByKey(array, key) {
      return array.sort(function(a, b) {
          var x = a[key]; var y = b[key];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

    csvJSON(csv){
      var lines=csv.split("\n");
      var result = [];
    
      for(var i=0;i<lines.length;i++){
        var currentline=lines[i].split(",");
        if(lines[i] !== ""){
          var obj = {};
          obj["SERIES"] = currentline[0];
          obj["points"] = [];
          for(var j=1;j<currentline.length;j++){
            let dataObj = {};
            let keys = currentline[j].split("|")
            dataObj["x"] = keys[0];
            dataObj["y"] = keys[1];
            obj["points"].push(dataObj);
          }
      
          result.push(obj);
        }
      }
      return result;
    }

  render() {
    const data = this.state.data;
    return (
      <div className="App">
        <label className="custom-file-upload">
            <input type="file" accept=".csv" onChange={ (e) => this.handleChange(e.target.files) }/>
            Upload CSV file
        </label>
        <div className="errorMessage">{(!this.state.isFormatCorrect) && "Please choose a valid CSV file"}</div>
        {this.state.isDataPresent && (
          <div>
            <h1>LineChart</h1>
            <LineChart 
                width={600}
                height={400}
                data={this.state.data}
                showLegends = {true}
                xLabel = {"Year"}
                yLabel = {"Value"}
                onPointHover= {function(a){
                  return  a.x + " - " + a.y;
                }}
            />
          </div>
        )}
      </div>
    );
  }
}

export default App;
