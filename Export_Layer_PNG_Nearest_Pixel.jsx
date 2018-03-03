// PHOTOSHOP: Export Layer as PNG (cropped to nearest pixel)
// By Carlos Breban
// Usage: 
// 	1. Select layer or group
//	2. Run script
// NOTE: PNG will be located in a child folder named "_SAVEOUT_TEMP" that's relative to the active PSD.

function SaveForWeb(saveFile) {  
	var sfwOptions = new ExportOptionsSaveForWeb();   
	sfwOptions.format = SaveDocumentType.PNG;   
	sfwOptions.PNG8 = false;
	sfwOptions.includeProfile = false;   
	sfwOptions.interlaced = false;   
	sfwOptions.quality = 100;   
	activeDocument.exportDocument(saveFile, ExportType.SAVEFORWEB, sfwOptions);  
	}

function NewDocClipboardSize(){
	var idMk = charIDToTypeID( "Mk  " );
	var masterDescriptor = new ActionDescriptor();
	var clipBoardDesc = new ActionDescriptor();
	clipBoardDesc.putString( stringIDToTypeID( "preset" ), """Clipboard""" );
	masterDescriptor.putObject( charIDToTypeID( "Nw  " ), charIDToTypeID( "Dcmn" ), clipBoardDesc );
	masterDescriptor.putInteger( charIDToTypeID( "DocI" ), 436 );
	executeAction( idMk, masterDescriptor, DialogModes.NO );
	}

function RasterizeLayerStyle(){
	var idRasterizeLayer = stringIDToTypeID( "rasterizeLayer" );
	var masterDescriptor = new ActionDescriptor();
	var mainRef = new ActionReference();
	mainRef.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
	masterDescriptor.putReference( charIDToTypeID( "null" ), mainRef );
	masterDescriptor.putEnumerated( charIDToTypeID( "What" ), stringIDToTypeID( "rasterizeItem" ), stringIDToTypeID( "layerStyle" ) );
	executeAction( idRasterizeLayer, masterDescriptor, DialogModes.NO );
	}

function Main(){
	if(documents.length>0){  
		//duplicate selected layer/group and merge
		var doc = app.activeDocument; 
		var selLayer = doc.activeLayer;
		var tmpLayer = selLayer.duplicate();
		
		if(selLayer.typename != "LayerSet"){
			tmpLayer.rasterize(RasterizeType.ENTIRELAYER);
			doc.activeLayer = tmpLayer;
			RasterizeLayerStyle();
			}
		else{
			doc.activeLayer = tmpLayer;   
			tmpLayer.merge();
			}  
			
		//select pixel contents and copy to clipboard	
		tmpLayer = doc.activeLayer;       
		doc.selection.selectAll();
		doc.selection.copy();
		var layerName = selLayer.name + "";
		
		//paste into new document at clipboard size
		NewDocClipboardSize();
		newDoc = app.activeDocument; 
		newDoc.paste();
		newDoc.activeLayer.name = layerName;
		newDoc.layers[1].remove();
	   
		//save PNG to relative path
		var errorCatch;
		var docPath;
		try{docPath = (doc.path);}
		catch (errorCatch){}
		if(docPath != null)
			 var saveFolderPath =  (docPath + "/_SAVEOUT_TEMP/");  
		else alert ("File must be saved."); 
		
		if(!Folder(saveFolderPath).exists)
			Folder(saveFolderPath).create(); 

		var pngFilePath = File(saveFolderPath + layerName + ".png");
		if(pngFilePath.exists)
			pngFilePath.remove(); 
		
		SaveForWeb(pngFilePath);  
		newDoc.close(SaveOptions.DONOTSAVECHANGES);
		
		//clean up working layer and select original layer
		tmpLayer.remove();
		doc.selection.deselect();
		doc.activeLayer = selLayer;
		}
	}
Main();

