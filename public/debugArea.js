var debugCount = 0;

function debugArea(title, output) {
    console.log("###########################################################");
    console.log(title + ' AREA');
    debugCount++;
    console.log("Count: " + debugCount);
    console.log(output);
    console.log("###########################################################");
}

module.exports = debugArea;