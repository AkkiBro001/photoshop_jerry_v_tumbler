//FONT NANE
var FONT_NAME = ["Arial", "Times New Roman", "Impact"];

//NAMES
var NAMES = ["Amelia", "Isabella", "Sophia"];

//Folder Name
var BACKGROUND_IMAGE_FOLDER = "Background Images";
var IMAGES_FOLDER = "Images";

//Element Placement
var ELEMENT_PLACEMENT = {
  PLACEAFTER: "PLACEAFTER",
  PLACEBEFORE: "PLACEBEFORE",
  PLACEATBEGINNING: "PLACEATBEGINNING",
  PLACEATEND: "PLACEATEND",
  INSIDE: "INSIDE"
};

app.preferences.rulerUnits = Units.PIXELS;

//Object Constructor
function info(doc) {
  //Variables
  var docPathArr = [];
  var docPath = doc.path;
  //function for docpath Array
  (function () {
    docPathArr = docPath.toString().replace(/%20/g, " ").split("/");

    docPathArr.shift();

    docPathArr[0] = docPathArr[0] + ":";

    return docPathArr;
  })();

  this.docName = doc.name;

  this.docOnlyName = doc.name.split(".")[doc.name.split(".").length - 2];

  this.docOnlyNameArr = this.docOnlyName.split(" ");

  this.docType = doc.name
    .split(".")
    [doc.name.split(".").length - 1].toLowerCase();

  this.docLocation = {
    normalPath: docPath,

    arrPath: docPathArr,

    cleanPath: docPathArr.join("/"),
  };

  this.docSize = {
    docWidth: doc.width.value,

    docHeigth: doc.height.value,

    docResolution: doc.resolution.value,
  };

  this.docLength = doc.layers.length;

  this.topLayerName = doc.layers[0].name;
}

function getFileNamesInFolder(path, folderName) {
  var folder = new Folder(path + "/" + folderName);
  var files = folder.getFiles();
  var fileNames = [];

  for (var i = 0; i < files.length; i++) {
    if (files[i] instanceof File) {
      fileNames.push(files[i].name);
    }
  }

  return fileNames;
}

function generateCombinations(backgrounds, fonts, names, images) {
  var combinations = [];

  for (var i = 0; i < fonts.length; i++) {
    for (var j = 0; j < names.length; j++) {
      for (var k = 0; k < backgrounds.length; k++) {
        for (var l = 0; l < images.length; l++) {
          combinations.push({
            background: backgrounds[k],
            font: fonts[i],
            name: names[j],
            image: images[l],
          });
        }
      }
    }
  }

  return combinations;
}

function findLayer(ref, name) {
  // declare local variables
  var layers = ref.layers;
  var len = layers.length;
  var match = false;

  // iterate through layers to find a match
  for (var i = 0; i < len; i++) {
    // test for matching layer
    var layer = layers[i];
    if (layer.name.toLowerCase() == name.toLowerCase()) {
      // select matching layer
      activeDocument.activeLayer = layer;
      match = true;
      break;
    }
    // handle groups (layer sets)
    else if (layer.typename == "LayerSet") {
      match = findLayer(layer, name);
      if (match) {
        break;
      }
    }
  }
  return match;
}

function hexToRgb(hex) {
  // Remove the hash if present
  hex = hex.replace(/^#/, "");

  // Parse the hex color
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return [r, g, b];
}

function interactiveSetColorFill(rgbColor) {
  /*
  Get the colour fill RGB values
  https://community.adobe.com/t5/photoshop-ecosystem-discussions/get-current-solid-layer-color-hex-code-in-alert/td-p/10830649
  */
  var r = new ActionReference();
  r.putProperty(stringIDToTypeID("property"), stringIDToTypeID("adjustment"));
  r.putEnumerated(
    stringIDToTypeID("layer"),
    stringIDToTypeID("ordinal"),
    stringIDToTypeID("targetEnum")
  );
  var objAdjustment = executeActionGet(r).getList(
    stringIDToTypeID("adjustment")
  );
  var objsolidColorLayer = objAdjustment.getObjectValue(0);
  var objRGBColor = objsolidColorLayer.getObjectValue(
    stringIDToTypeID("color")
  );

  /*
  Set the colour fill RGB values
  */
  function s2t(s) {
    return app.stringIDToTypeID(s);
  }
  var descriptor = new ActionDescriptor();
  var descriptor2 = new ActionDescriptor();
  var descriptor3 = new ActionDescriptor();
  var reference = new ActionReference();
  reference.putEnumerated(
    s2t("contentLayer"),
    s2t("ordinal"),
    s2t("targetEnum")
  );
  descriptor.putReference(s2t("null"), reference);
  descriptor3.putDouble(s2t("red"), rgbColor[0]);
  descriptor3.putDouble(s2t("grain"), rgbColor[1]);
  descriptor3.putDouble(s2t("blue"), rgbColor[2]);
  descriptor2.putObject(s2t("color"), s2t("RGBColor"), descriptor3);
  descriptor.putObject(s2t("to"), s2t("solidColorLayer"), descriptor2);
  executeAction(s2t("set"), descriptor, DialogModes.NO);
}

function setSolidColor(doc, rgbColor, targetLayer) {
  const isLayerfind = findLayer(doc, targetLayer);
  if (!isLayerfind) throw targetLayer + " is missing";

  // Function to set solid color value of a layer using hex color

  // Ensure there is an active layer
  if (app.activeDocument.activeLayer === null) {
    throw "No active layer!";
  }

  var layer = doc.activeLayer;

  // Ensure the layer is a solid color fill layer
  if (layer.kind !== LayerKind.SOLIDFILL) {
    throw "The active layer is not a solid color fill layer!";
  }

  interactiveSetColorFill(rgbColor);
}

function selectAllLayers(){
	
  cTID = function(s) { return cTID[s] || (cTID[s] = app.charIDToTypeID(s)); };
  sTID = function(s) { return app.stringIDToTypeID(s); }; 
  
  var ref = new ActionReference();
  ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
  var desc = new ActionDescriptor();
  desc.putReference(cTID('null'), ref);
  executeAction(sTID('selectAllLayers'), desc, DialogModes.NO);
  
  }

  function duplicateLayer (folder_name, file_name, resizeArray, targetDoc, documentDetails) {
    var rootPath = documentDetails.docLocation.cleanPath;
    app.open(new File(rootPath + "/" + folder_name + "/" + file_name))
    var current_doc = app.activeDocument;
    executeAction(stringIDToTypeID("newPlacedLayer"));
    current_doc.resizeImage(resizeArray[0],UnitValue(resizeArray[1],"px"),resizeArray[2],ResampleMethod.BICUBIC);
    current_doc.activeLayer.duplicate(targetDoc, ElementPlacement[ELEMENT_PLACEMENT.PLACEATBEGINNING])
    current_doc.close(SaveOptions.DONOTSAVECHANGES)
    
  }

  function transformText(activeDoc) {
     // Ensure the layer is a text layer
     var textLayer = activeDoc.activeLayer;
     if (textLayer.kind == LayerKind.TEXT) {
      // Set the reference point to the center of the text layer
      activeDoc.activeLayer = textLayer;
      var idsetd = charIDToTypeID( "setd" );
      var desc100 = new ActionDescriptor();
      var idnull = charIDToTypeID( "null" );
      var ref1 = new ActionReference();
      var idlayer = charIDToTypeID( "Lyr " );
      ref1.putEnumerated( idlayer, charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
      desc100.putReference( idnull, ref1 );
      var idT = charIDToTypeID( "T   " );
      var desc101 = new ActionDescriptor();
      var idOfst = charIDToTypeID( "Ofst" );
      var desc102 = new ActionDescriptor();
      desc102.putUnitDouble( charIDToTypeID( "Hrzn" ), charIDToTypeID( "#Pxl" ), 0 );
      desc102.putUnitDouble( charIDToTypeID( "Vrtc" ), charIDToTypeID( "#Pxl" ), 0 );
      var idPnt = charIDToTypeID( "Pnt " );
      desc101.putObject( idOfst, idPnt, desc102 );
      var idOfst = charIDToTypeID( "Ofst" );
      desc100.putObject( idT, idOfst, desc101 );
      executeAction( idsetd, desc100, DialogModes.NO );

      // Get the current bounds of the text layer
      var bounds = textLayer.bounds;
      var currentWidth = bounds[2].as("px") - bounds[0].as("px");
      var currentHeight = bounds[3].as("px") - bounds[1].as("px");

      // Define the new pixel dimensions
      var newWidth = 500; // new width in pixels
      var newHeight = 300; // new height in pixels

      // Calculate the scale percentages
      var widthScale = (newWidth / currentWidth) * 100;
      var heightScale = (newHeight / currentHeight) * 100;

      // Transform the text layer: scale and rotate
      var idTrnf = charIDToTypeID( "Trnf" );
      var descTransform = new ActionDescriptor();
      descTransform.putEnumerated( charIDToTypeID( "FTcs" ), charIDToTypeID( "QCSt" ), charIDToTypeID( "Qcsa" ) );
      descTransform.putUnitDouble( charIDToTypeID( "Wdth" ), charIDToTypeID( "#Prc" ), widthScale ); // scale width
      descTransform.putUnitDouble( charIDToTypeID( "Hght" ), charIDToTypeID( "#Prc" ), heightScale ); // scale height
      //descTransform.putUnitDouble( charIDToTypeID( "Angl" ), charIDToTypeID( "#Ang" ), 45.000000 ); // rotate 45 degrees

      executeAction( idTrnf, descTransform, DialogModes.NO );
  } else {
      alert("The selected layer is not a text layer.");
  }

  }


  function set_background_image(doc, documentDetails, combination){
    var find_bg = findLayer(doc, "Background")
    if(!find_bg) return alert("Background layerset is missing")
    var Background_Group = doc.activeLayer
    if(Background_Group.typename !== 'LayerSet') return alert("Background should be a group layer") 
    
      if(Background_Group.typename === 'LayerSet'|| Background_Group.layers.length === 1) {
          duplicateLayer(BACKGROUND_IMAGE_FOLDER, combination.background, [null, doc.height.value, null], doc, documentDetails)
          doc.activeLayer.move(Background_Group, ElementPlacement[ELEMENT_PLACEMENT.INSIDE])
          doc.activeLayer.name = "Background"
      }else{
         return alert("Invaild layer Structure")
      }
  }

  function set_name(doc, documentDetails, combination){
    var Bottle = findLayer(doc, "Bottle")
    executeAction(stringIDToTypeID("placedLayerEditContents"));
    var BottleDoc = app.activeDocument;
    BottleDoc.activeLayer = BottleDoc.layers[0]
    transformText(BottleDoc)
  }

function main() {
  if (app.documents.length === 0) return;
  var doc = app.activeDocument;
  var documentDetails = new info(doc);
  var rootPath = documentDetails.docLocation.cleanPath;

   /******************************************/
   /************ COLOR SETUP ******************/
   /******************************************/


  //Color
  // var COLOR = prompt("Enter color hexcode value e.g '#ffff00'", "");
  // if (!COLOR || COLOR.indexOf("#") === -1 || COLOR.length !== 7)
  //   return alert("Invaild Hex Code");
  // var rgbColor = hexToRgb(COLOR);

  //Set Solid Color 1
  //setSolidColor(doc, rgbColor, "Handle Color");

  //Set Solid Color 2
  //setSolidColor(doc, rgbColor, "Lead Color");

  //Set Solid Color 3
  // var Bottle = findLayer(doc, "Bottle")
  // if(!Bottle) return alert("Bottle Layer is missing")
  // executeAction(stringIDToTypeID("placedLayerEditContents"));
  // var BottleDoc = app.activeDocument;
  // var BottleColor = findLayer(BottleDoc, "Bottle Color")
  // if(!BottleColor) return alert("BottleColor Layer is missing") 
  // setSolidColor(BottleDoc, rgbColor, "Bottle Color");
  // BottleDoc.close(SaveOptions.SAVECHANGES);

   /******************************************/
   /************ IMAGES SETUP ****************/
  /******************************************/

  var background_images = getFileNamesInFolder(rootPath, BACKGROUND_IMAGE_FOLDER);
  var images = getFileNamesInFolder(rootPath, IMAGES_FOLDER);

  if (
    background_images.length === 0 ||
    FONT_NAME.length === 0 ||
    NAMES.length === 0 ||
    images.length === 0
  )
    return alert("Data Missing");
  
  /* Set Combination */
  var combination = generateCombinations(background_images, FONT_NAME, NAMES, images)
  var cominationLength = combination.length;

  var comb1 = combination[5]


  //set_background_image(doc, documentDetails, comb1)

  set_name(doc, documentDetails, comb1)

  


}

main();
