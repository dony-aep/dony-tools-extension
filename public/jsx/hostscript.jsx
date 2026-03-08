// =========================================================================
// json2.js (JSON polyfill)
// https://github.com/douglascrockford/JSON-js/blob/master/json2.js
// Public Domain.
// =========================================================================
if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    var rx_one = /^[\],:{}\s]*$/,
        rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rx_four = /(?:^|:|,)(?:\s*\[)+/g,
        rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? '0' + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                        f(this.getUTCMonth() + 1) + '-' +
                        f(this.getUTCDate()) + 'T' +
                        f(this.getUTCHours()) + ':' +
                        f(this.getUTCMinutes()) + ':' +
                        f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? '"' + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"'
            : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value)
                ? String(value)
                : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the value is an object, we have three cases: null, array, and object.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the value is an object, process all of its elements.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ': '
                                    : ':'
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ': '
                                    : ':'
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling limitations in IE's and Safari's regexp engines. First we remove
// the JSON notation tokens from the text. Then we remove all simple value tokens.
// Then we remove the '[]' character pair. Finally, we look to see that the remaining
// text is made up of whitespace tokens.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, '@')
                        .replace(rx_three, ']')
                        .replace(rx_four, '')
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to interpretation in
// JavaScript, depending on context. We force the '{' to be interpreted as
// an object literal rather than a block delineation by wrapping the text in
// parentheses.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

// Función para obtener la ruta del script
function getScriptPath() {
    try {
        // Usar directamente la carpeta de documentos del usuario
        var userFolder = new Folder(Folder.myDocuments.fsName + "/Adobe/dony Tools Data");
        if (!userFolder.exists) {
            userFolder.create();
        }
        return userFolder.fsName;
    } catch (e) {
        alert("Error getting script path: " + e.toString());
        return null;
    }
}

// Función para analizar JSON
function parseJSON(str) {
    try {
        // Now using the polyfill if native JSON is not available
            return JSON.parse(str);
    } catch (e) {
        throw new Error("Invalid JSON: " + e.message);
    }
}

// Funciones para mostrar alertas
function showNumericAlert() {
    alert("Please enter a valid number");
    return "alerted";
}

function showSpeedAlert() {
    alert("Please enter a valid number for speed");
    return "alerted";
}

function showOffsetAlert() {
    alert("Please enter valid numbers for offset values");
    return "alerted";
}

// Función para validar los valores de offset
function validateOffsetValues(offsetX, offsetY) {
    // Validar que los valores de offset sean números válidos
    offsetX = parseFloat(offsetX);
    offsetY = parseFloat(offsetY);
    
    if (isNaN(offsetX) || isNaN(offsetY)) {
        alert("Please enter valid numbers for offset values");
        return "invalid_offset";
    }
    
    return "valid";
}

// Detecta si Twixtor está instalado y si es compatible (v5+)
// Las propiedades usadas por la extensión (Speed %, Frame Rate, Motion Vectors,
// Image Prep, Frame Interp, Warping) tienen los mismos nombres desde v5 hasta v8.
// Versiones anteriores a v5 usan nombres distintos.
function getTwixtorInfo() {
    var tempComp = null;
    var tempSolid = null;
    var tempSolidSource = null;
    var result = { installed: false, name: "", variant: "", compatible: false };

    try {
        tempComp = app.project.items.addComp("__twixtor_detect__", 100, 100, 1, 1, 24);
        tempSolid = tempComp.layers.addSolid([0, 0, 0], "__detect__", 100, 100, 1);
        tempSolidSource = tempSolid.source;
        var fx = null;
        
        // Intentar Twixtor Pro primero, luego Twixtor regular
        try {
            fx = tempSolid.Effects.addProperty("Twixtor Pro");
            result.variant = "pro";
        } catch (e) {
            try {
                fx = tempSolid.Effects.addProperty("Twixtor");
                result.variant = "regular";
            } catch (e2) {
                // Ni Pro ni regular encontrado
            }
        }
        
        if (fx) {
            result.installed = true;
            result.name = fx.name;
            
            // Verificar compatibilidad: "Image Prep" existe desde v5+
            // Si la propiedad existe, las demás propiedades también coinciden
            try {
                var ip = fx.property("Image Prep");
                result.compatible = (ip !== null);
            } catch (e) {
                result.compatible = false;
            }
        }

        return JSON.stringify(result);
    } catch (e) {
        result.error = e.toString();
        return JSON.stringify(result);
    } finally {
        if (tempSolid) {
            try {
                tempSolid.remove();
            } catch (e) {}
        }

        if (tempComp) {
            try {
                tempComp.remove();
            } catch (e) {}
        }

        if (tempSolidSource) {
            try {
                if (!tempSolidSource.usedIn || tempSolidSource.usedIn.length === 0) {
                    tempSolidSource.remove();
                }
            } catch (e) {
                try {
                    tempSolidSource.remove();
                } catch (e2) {}
            }
        }
    }
}

// Función para precomponer y aplicar Twixtor Pro
function precomposeAndApplyTwixtor(settingsObj) {
    // settingsObj: { speed, frameRate, motionVectors, imagePrep, frameInterp, warping, batch }
    var targetSpeed = parseFloat(settingsObj.speed);
    if (isNaN(targetSpeed)) {
        alert("Please enter a valid number for speed");
        return "invalid_speed";
    }

    var inputFrameRate = parseFloat(settingsObj.frameRate) || 30;
    var motionVectors = parseInt(settingsObj.motionVectors) || 1;
    var imagePrep = parseInt(settingsObj.imagePrep) || 2;
    var frameInterp = parseInt(settingsObj.frameInterp) || 3;
    var warping = parseInt(settingsObj.warping) || 2;
    var batchMode = settingsObj.batch === true;
    
    var activeItem = app.project.activeItem;

    if (activeItem && activeItem instanceof CompItem && activeItem.selectedLayers.length > 0) {
        var selectedLayers = activeItem.selectedLayers;
        
        if (!batchMode) {
            // Single layer mode — original behavior
            var selectedLayer = selectedLayers[0];
            var originalLayerName = selectedLayer.name;
            var selectedLayerIndex = selectedLayer.index;
            
            app.beginUndoGroup("Precompose and Apply Twixtor Pro");

            try {
                activeItem.layers.precompose(
                    [selectedLayerIndex],
                    originalLayerName + " Pre-Comp",
                    true
                );

                var firstPrecompLayer = activeItem.layer(selectedLayerIndex);

                var twixtorEffect = firstPrecompLayer.Effects.addProperty("Twixtor Pro");
                if (twixtorEffect) {
                    try {
                        twixtorEffect.property("Input: Frame Rate").setValue(inputFrameRate);
                        twixtorEffect.property("Motion Vectors").setValue(motionVectors);
                        twixtorEffect.property("Image Prep").setValue(imagePrep);
                        twixtorEffect.property("Frame Interp").setValue(frameInterp);
                        twixtorEffect.property("Warping").setValue(warping);

                        var speedProperty = twixtorEffect.property("Speed %");
                        var comp = app.project.activeItem;
                        var frameDuration = (comp && comp instanceof CompItem) ? comp.frameDuration : 0.033;
                        speedProperty.setValueAtTime(0, 100);
                        speedProperty.setValueAtTime(frameDuration, targetSpeed);
                        
                        activeItem.layers.precompose(
                            [selectedLayerIndex],
                            originalLayerName + " Twixtored",
                            true
                        );
                        
                        app.endUndoGroup();
                        return "success";
                    } catch (settingsError) {
                        app.endUndoGroup();
                        alert("Error applying settings: " + settingsError.toString());
                        return "error";
                    }
                } else {
                    app.endUndoGroup();
                    alert("Failed to apply Twixtor Pro. Make sure the effect is installed.");
                    return "error";
                }
            } catch (e) {
                app.endUndoGroup();
                alert("Error: " + e.toString());
                return "error";
            }
        } else {
            // Batch mode — apply to all selected layers
            // Collect layer indices in reverse order (highest first) to avoid index shifting
            var layerIndices = [];
            for (var i = 0; i < selectedLayers.length; i++) {
                layerIndices.push({ index: selectedLayers[i].index, name: selectedLayers[i].name });
            }
            layerIndices.sort(function(a, b) { return b.index - a.index; });

            app.beginUndoGroup("Batch Precompose and Apply Twixtor Pro");

            var successCount = 0;
            var errorCount = 0;

            try {
                for (var j = 0; j < layerIndices.length; j++) {
                    var layerInfo = layerIndices[j];
                    try {
                        activeItem.layers.precompose(
                            [layerInfo.index],
                            layerInfo.name + " Pre-Comp",
                            true
                        );

                        var precompLayer = activeItem.layer(layerInfo.index);
                        var effect = precompLayer.Effects.addProperty("Twixtor Pro");

                        if (effect) {
                            effect.property("Input: Frame Rate").setValue(inputFrameRate);
                            effect.property("Motion Vectors").setValue(motionVectors);
                            effect.property("Image Prep").setValue(imagePrep);
                            effect.property("Frame Interp").setValue(frameInterp);
                            effect.property("Warping").setValue(warping);

                            var spd = effect.property("Speed %");
                            var fd = activeItem.frameDuration;
                            spd.setValueAtTime(0, 100);
                            spd.setValueAtTime(fd, targetSpeed);

                            activeItem.layers.precompose(
                                [layerInfo.index],
                                layerInfo.name + " Twixtored",
                                true
                            );

                            successCount++;
                        } else {
                            errorCount++;
                        }
                    } catch (layerErr) {
                        errorCount++;
                    }
                }

                app.endUndoGroup();

                if (errorCount > 0) {
                    alert("Batch Twixtor: " + successCount + " layers processed, " + errorCount + " failed.");
                }
                return successCount > 0 ? "success" : "error";
            } catch (e) {
                app.endUndoGroup();
                alert("Error in batch processing: " + e.toString());
                return "error";
            }
        }
    } else {
        alert("Please select a layer in the active composition.");
        return "error";
    }
}

// Función para mover el punto de anclaje
function moveAnchorPoint(position, offsetX, offsetY) {
    // Validar que los valores de offset sean números válidos
    offsetX = parseFloat(offsetX);
    offsetY = parseFloat(offsetY);
    
    if (isNaN(offsetX) || isNaN(offsetY)) {
        alert("Please enter valid numbers for offset values");
        return "invalid_offset";
    }
    
    var activeItem = app.project.activeItem;

    if (activeItem && activeItem instanceof CompItem && activeItem.selectedLayers.length > 0) {
        app.beginUndoGroup("Move Anchor Point");

        try {
            var selectedLayers = activeItem.selectedLayers;
            var bounds = calculateLayersBounds(selectedLayers);

            // Aplicar el movimiento a cada capa seleccionada
            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                
                // Obtener las propiedades actuales de la capa
                var originalAnchor = layer.anchorPoint.value;
                var originalPosition = layer.position.value;
                var originalScale = layer.scale.value;
                var originalRotation = 0;
                
                // Obtener la rotación si existe
                if (layer.rotation) {
                    originalRotation = layer.rotation.value;
                } else if (layer.transform.rotation) {
                    originalRotation = layer.transform.rotation.value;
                }
                
                // Obtener el rectángulo de origen en el tiempo actual
                var rect = layer.sourceRectAtTime(activeItem.time, false);
                var width = rect.width;
                var height = rect.height;
                var left = rect.left;
                var top = rect.top;

                // Calcular el nuevo punto de anclaje basado en la posición solicitada
                var newX = originalAnchor[0];
                var newY = originalAnchor[1];

                // Si hay múltiples capas seleccionadas, usar los bounds globales
                if (selectedLayers.length > 1) {
                    switch (position) {
                        case "topLeft":
                            newX = bounds.left;
                            newY = bounds.top;
                            break;
                        case "top":
                            newX = bounds.left + bounds.width / 2;
                            newY = bounds.top;
                            break;
                        case "topRight":
                            newX = bounds.left + bounds.width;
                            newY = bounds.top;
                            break;
                        case "left":
                            newX = bounds.left;
                            newY = bounds.top + bounds.height / 2;
                            break;
                        case "center":
                            newX = bounds.left + bounds.width / 2;
                            newY = bounds.top + bounds.height / 2;
                            break;
                        case "right":
                            newX = bounds.left + bounds.width;
                            newY = bounds.top + bounds.height / 2;
                            break;
                        case "bottomLeft":
                            newX = bounds.left;
                            newY = bounds.top + bounds.height;
                            break;
                        case "bottom":
                            newX = bounds.left + bounds.width / 2;
                            newY = bounds.top + bounds.height;
                            break;
                        case "bottomRight":
                            newX = bounds.left + bounds.width;
                            newY = bounds.top + bounds.height;
                            break;
                    }
                } else {
                    // Comportamiento para una sola capa
                    switch (position) {
                        case "topLeft":
                            newX = left;
                            newY = top;
                            break;
                        case "top":
                            newX = left + width / 2;
                            newY = top;
                            break;
                        case "topRight":
                            newX = left + width;
                            newY = top;
                            break;
                        case "left":
                            newX = left;
                            newY = top + height / 2;
                            break;
                        case "center":
                            newX = left + width / 2;
                            newY = top + height / 2;
                            break;
                        case "right":
                            newX = left + width;
                            newY = top + height / 2;
                            break;
                        case "bottomLeft":
                            newX = left;
                            newY = top + height;
                            break;
                        case "bottom":
                            newX = left + width / 2;
                            newY = top + height;
                            break;
                        case "bottomRight":
                            newX = left + width;
                            newY = top + height;
                            break;
                    }
                }

                // Aplicar offsets (con el eje Y invertido)
                newX += offsetX; // X positivo -> derecha, X negativo -> izquierda
                newY += -offsetY; // Y positivo -> arriba, Y negativo -> abajo (invertido)

                // Calcular el cambio en el punto de anclaje
                var deltaX = newX - originalAnchor[0];
                var deltaY = newY - originalAnchor[1];
                
                // Calcular la nueva posición compensando el cambio de ancla
                // Teniendo en cuenta la escala y rotación de la capa
                var scaleFactorX = originalScale[0] / 100;
                var scaleFactorY = originalScale[1] / 100;
                
                // Convertir rotación a radianes
                var rotationRadians = degreesToRadians(originalRotation);
                
                // Calcular el desplazamiento compensando escala y rotación
                var compensatedDeltaX, compensatedDeltaY;
                
                if (Math.abs(originalRotation) < 0.001) {
                    // Sin rotación, solo aplicar escala
                    compensatedDeltaX = deltaX * scaleFactorX;
                    compensatedDeltaY = deltaY * scaleFactorY;
                } else {
                    // Con rotación, aplicar transformación completa
                    var scaledDeltaX = deltaX * scaleFactorX;
                    var scaledDeltaY = deltaY * scaleFactorY;
                    
                    compensatedDeltaX = scaledDeltaX * Math.cos(rotationRadians) - scaledDeltaY * Math.sin(rotationRadians);
                    compensatedDeltaY = scaledDeltaX * Math.sin(rotationRadians) + scaledDeltaY * Math.cos(rotationRadians);
                }
                
                // Calcular la nueva posición
                var newPosition = [
                    originalPosition[0] + compensatedDeltaX,
                    originalPosition[1] + compensatedDeltaY,
                    originalPosition[2] || 0
                ];
                
                // Aplicar los cambios
                layer.anchorPoint.setValue([newX, newY]);
                layer.position.setValue(newPosition);
            }
            
            app.endUndoGroup();
            return "success";
        } catch (e) {
            app.endUndoGroup();
            alert("Error moving anchor point: " + e.toString());
            return "error";
        }
    } else {
        alert("Please select at least one layer in the active composition.");
        return "error";
    }
}

// Función auxiliar para convertir grados a radianes
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Función para resetear el punto de anclaje
function resetAnchorPoint() {
    var activeItem = app.project.activeItem;
    if (activeItem && activeItem instanceof CompItem && activeItem.selectedLayers.length > 0) {
        app.beginUndoGroup("Reset Anchor Point");
        
        try {
            var selectedLayers = activeItem.selectedLayers;
            
            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                
                // Obtener el rectángulo de origen en el tiempo actual de la composición
                var rect = layer.sourceRectAtTime(activeItem.time, false);
                
                // Obtener las propiedades actuales de la capa
                var originalAnchor = layer.anchorPoint.value;
                var originalPosition = layer.position.value;
                var originalScale = layer.scale.value;
                var originalRotation = 0;
                
                // Obtener la rotación si existe
                if (layer.rotation) {
                    originalRotation = layer.rotation.value;
                } else if (layer.transform.rotation) {
                    originalRotation = layer.transform.rotation.value;
                }
                
                // Calcular el centro
                var centerX = rect.left + rect.width / 2;
                var centerY = rect.top + rect.height / 2;
                
                // Calcular el cambio en el punto de anclaje
                var deltaX = centerX - originalAnchor[0];
                var deltaY = centerY - originalAnchor[1];
                
                // Calcular la nueva posición compensando el cambio de ancla
                // Teniendo en cuenta la escala y rotación de la capa
                var scaleFactorX = originalScale[0] / 100;
                var scaleFactorY = originalScale[1] / 100;
                
                // Convertir rotación a radianes
                var rotationRadians = degreesToRadians(originalRotation);
                
                // Calcular el desplazamiento compensando escala y rotación
                var compensatedDeltaX, compensatedDeltaY;
                
                if (Math.abs(originalRotation) < 0.001) {
                    // Sin rotación, solo aplicar escala
                    compensatedDeltaX = deltaX * scaleFactorX;
                    compensatedDeltaY = deltaY * scaleFactorY;
                } else {
                    // Con rotación, aplicar transformación completa
                    var scaledDeltaX = deltaX * scaleFactorX;
                    var scaledDeltaY = deltaY * scaleFactorY;
                    
                    compensatedDeltaX = scaledDeltaX * Math.cos(rotationRadians) - scaledDeltaY * Math.sin(rotationRadians);
                    compensatedDeltaY = scaledDeltaX * Math.sin(rotationRadians) + scaledDeltaY * Math.cos(rotationRadians);
                }
                
                // Calcular la nueva posición
                var newPosition = [
                    originalPosition[0] + compensatedDeltaX,
                    originalPosition[1] + compensatedDeltaY,
                    originalPosition[2] || 0
                ];
                
                // Mover el punto de anclaje al centro
                layer.anchorPoint.setValue([centerX, centerY]);
                
                // Compensar la posición
                layer.position.setValue(newPosition);
            }
            
            app.endUndoGroup();
            return "success";
        } catch (e) {
            app.endUndoGroup();
            alert("Error resetting anchor point: " + e.toString());
            return "error";
        }
    } else {
        alert("Please select at least one layer in the active composition.");
        return "error";
    }
}

// Función auxiliar para calcular los bounds globales de múltiples capas
function calculateLayersBounds(layers) {
    var bounds = {
        left: Number.POSITIVE_INFINITY,
        top: Number.POSITIVE_INFINITY,
        right: Number.NEGATIVE_INFINITY,
        bottom: Number.NEGATIVE_INFINITY,
        width: 0,
        height: 0
    };
    
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var rect = layer.sourceRectAtTime(0, false);
        
        bounds.left = Math.min(bounds.left, rect.left);
        bounds.top = Math.min(bounds.top, rect.top);
        bounds.right = Math.max(bounds.right, rect.left + rect.width);
        bounds.bottom = Math.max(bounds.bottom, rect.top + rect.height);
    }
    
    bounds.width = bounds.right - bounds.left;
    bounds.height = bounds.bottom - bounds.top;
    
    return bounds;
}

// Función modificada para guardar los módulos de salida
function saveOutputModules(modules) {
    try {
        var scriptPath = getScriptPath();
        if (!scriptPath) return false;
        
        var jsonFile = new File(scriptPath + "/outputModules.json");
        
        if (jsonFile.open('w')) {
            // Usar JSON.stringify con indentación para mejor legibilidad
            jsonFile.write(JSON.stringify(modules, null, 2));
            jsonFile.close();
            return true;
        } else {
            throw new Error("Cannot write to file: " + jsonFile.fsName);
        }
    } catch (e) {
        alert("Error saving output modules: " + e.toString());
        return false;
    }
}

// Función modificada para cargar los módulos de salida
function loadOutputModules() {
    try {
        var scriptPath = getScriptPath();
        if (!scriptPath) return null;
        
        var jsonFile = new File(scriptPath + "/outputModules.json");
        if (!jsonFile.exists) {
            return null;
        }
        
        if (jsonFile.open('r')) {
            var content = jsonFile.read();
            jsonFile.close();
            
            if (content) {
                return content; // Devolver el contenido como string para procesarlo en JS
            }
        }
        return null;
    } catch (e) {
        alert("Error loading output modules: " + e.toString());
        return null;
    }
}

// Función modificada para obtener los módulos de salida
function getOutputModules() {
    var outputModules = ["Select Output Module..."];
    var activeComp = app.project.activeItem;
    
    try {
        app.beginUndoGroup("Get Output Modules");
        
        var tempComp = app.project.items.addComp("temp", 100, 100, 1, 1, 30);
        var tempRenderQueueItem = app.project.renderQueue.items.add(tempComp);
        var templates = tempRenderQueueItem.outputModule(1).templates;
        
        for (var i = 0; i < templates.length; i++) {
            if (!templates[i].toString().match(/^_HIDDEN/)) {
                outputModules.push(templates[i]);
            }
        }
        
        tempRenderQueueItem.remove();
        tempComp.remove();
        
        if (activeComp) {
            activeComp.openInViewer();
        }

        // Guardar los módulos en el archivo JSON
        saveOutputModules(outputModules);
        
        app.endUndoGroup();
        
        return JSON.stringify(outputModules); // Devolver como JSON string
        
    } catch (e) {
        alert("Error getting output modules: " + e.toString());
        return JSON.stringify(["Select Output Module..."]); // Devolver al menos la opción por defecto
    }
}

// Función para añadir a la cola de render
function addToRenderQueue(selectedTemplate, autoRender) {
    var activeItem = app.project.activeItem;
    
    // Verificar si hay una composición activa
    if (!activeItem || !(activeItem instanceof CompItem)) {
        alert("Please select a composition first.");
        return "no_comp";
    }

    // Verificar si se ha seleccionado un módulo de salida válido
    if (selectedTemplate === "Select Output Module...") {
        alert("Please select an output module from the list.");
        return "invalid_module";
    }

    // Ejecutar el comando nativo de "Add to Render Queue"
    app.executeCommand(3984);

    // Obtener el último item añadido a la cola de render
    var renderQueueItem = app.project.renderQueue.items[app.project.renderQueue.numItems];
    var outputModule = renderQueueItem.outputModule(1);

    try {
        // Aplicar el template seleccionado
        outputModule.applyTemplate(selectedTemplate);

        // Determinar la extensión y el filtro basado en el formato de salida actual
        var fileExtension = ".mov"; // Por defecto
        var fileFilter = "All Files:*.*";
        
        // Obtener el formato actual del módulo de salida
        var outputFormat = outputModule.getSettings().Format;
        
        // Configurar la extensión y filtro según el formato
        if (outputFormat.indexOf("H.264") !== -1 || outputFormat.indexOf("H264") !== -1) {
            fileExtension = ".mp4";
            fileFilter = "MP4:*.mp4";
        } else if (outputFormat.indexOf("QuickTime") !== -1) {
            fileExtension = ".mov";
            fileFilter = "QuickTime:*.mov";
        } else if (outputFormat.indexOf("AVI") !== -1) {
            fileExtension = ".avi";
            fileFilter = "AVI:*.avi";
        } else if (outputFormat.indexOf("PNG") !== -1) {
            fileExtension = ".png";
            fileFilter = "PNG Sequence:*.png";
        } else if (outputFormat.indexOf("JPEG") !== -1) {
            fileExtension = ".jpg";
            fileFilter = "JPEG Sequence:*.jpg";
        }

        // Asegurarse de que el usuario seleccione la ubicación de salida
        var defaultFileName = activeItem.name.replace(/[\\\/:*\?"<>|]/g, "_");
        var suggestedPath = Folder.desktop.fsName + "/" + defaultFileName + fileExtension;
        var outputFile = new File(suggestedPath);
        outputFile = outputFile.saveDlg(
            "Save output as",
            fileFilter
        );
        
        if (outputFile != null) {
            outputModule.file = outputFile;
            
            // Iniciar render automático si el checkbox está marcado
            if (autoRender) {
                app.project.renderQueue.render();
            }
            return "success";
        } else {
            // Si el usuario cancela el diálogo de guardar, eliminar el item de la cola
            renderQueueItem.remove();
            return "cancelled";
        }
    } catch (e) {
        alert("Error applying output module: " + e.toString());
        renderQueueItem.remove();
        return "error";
    }
}

// Función para mostrar la ubicación de los ajustes
function showSettingsLocation() {
    var scriptPath = getScriptPath();
    if (scriptPath) {
        var jsonFile = new File(scriptPath + "/outputModules.json");
        try {
            if ($.os.indexOf("Windows") !== -1) {
                system.callSystem('explorer /select,"' + jsonFile.fsName + '"');
            } else {
                system.callSystem('open -R "' + jsonFile.fsName + '"');
            }
            return "success";
        } catch (e) {
            alert("Could not open settings location.");
            return "error";
        }
    }
    return "error";
}

// Función para visitar el sitio web
function visitWebsite() {
    var url = "https://donyaep.vercel.app/"; // URL del sitio web
    try {
        if ($.os.indexOf("Windows") !== -1) {
            system.callSystem('cmd /c "start ' + url + '"');
        } else {
            system.callSystem('open "' + url + '"');
        }
        return "success";
    } catch (e) {
        alert("Error opening URL: " + e.toString());
        return "error";
    }
}

// Función para crear setup personalizado
function createCustomSetup(settingsJSON) {
    var settings;
    
    try {
        // Parse the JSON if it's a string
        if (typeof settingsJSON === 'string') {
            settings = parseJSON(settingsJSON);
        } else {
            settings = settingsJSON;
        }
        
        app.beginUndoGroup("Create Custom Setup");
        
        // Calculate total duration in seconds
        var totalSeconds = (settings.hours * 3600) + (settings.minutes * 60) + settings.seconds;
        
        // Create custom folders
        var folders = settings.folders;
        var createdFolders = {};

        for (var i = 0; i < folders.length; i++) {
            var folderName = folders[i];
            if (!folderName || folderName === "") continue;
            
            var existingFolder = null;
            for (var j = 1; j <= app.project.numItems; j++) {
                if ((app.project.item(j) instanceof FolderItem) && (app.project.item(j).name === folderName)) {
                    existingFolder = app.project.item(j);
                    break;
                }
            }
            if (!existingFolder) {
                createdFolders[folderName] = app.project.items.addFolder(folderName);
            } else {
                createdFolders[folderName] = existingFolder;
            }
        }

        // Create compositions with custom names and folder assignments if provided
        for (var k = 1; k <= settings.numComps; k++) {
            // Use custom name if available, otherwise use default
            var compName = settings.compNames && settings.compNames[k-1] 
                ? settings.compNames[k-1] 
                : "Comp " + k;
                
            var compExists = false;
            for (var n = 1; n <= app.project.numItems; n++) {
                if ((app.project.item(n) instanceof CompItem) && (app.project.item(n).name === compName)) {
                    compExists = true;
                    break;
                }
            }
            
            if (!compExists) {
                var newComp = app.project.items.addComp(
                    compName,
                    settings.width,
                    settings.height,
                    1,
                    totalSeconds,
                    settings.fps
                );
                
                // Assign to folder if specified
                if (settings.compFolders && settings.compFolders[k-1] !== "") {
                    var folderName = settings.compFolders[k-1];
                    if (createdFolders[folderName]) {
                        newComp.parentFolder = createdFolders[folderName];
                    }
                }
            }
        }

        alert("Custom setup created successfully!");
        app.endUndoGroup();
        return "success";
    } catch (e) {
        app.endUndoGroup();
        alert("Error creating custom setup: " + e.toString());
        return "error";
    }
}

// Función para cargar presets guardados
function loadPresets() {
    try {
        var scriptPath = getScriptPath();
        if (!scriptPath) return "{}";
        
        var presetsFile = new File(scriptPath + "/projectPresets.json");
        if (!presetsFile.exists) {
            // If file doesn't exist, create an empty one with proper formatting
            presetsFile.open('w');
            presetsFile.write("{}");
            presetsFile.close();
            return "{}";
        }
        
        presetsFile.open('r');
        var content = presetsFile.read();
        presetsFile.close();
        
        if (!content || content === "") {
            return "{}";
        }
        
        // Validate JSON before returning
        try {
            parseJSON(content);
            return content;
        } catch (e) {
            alert("Invalid JSON in presets file. Creating a new one.");
            presetsFile.open('w');
            presetsFile.write("{}");
            presetsFile.close();
            return "{}";
        }
    } catch (e) {
        alert("Error loading presets: " + e.toString());
        return "{}";
    }
}

// Función para guardar un preset
function savePreset(presetName, settings) {
    try {
        var scriptPath = getScriptPath();
        if (!scriptPath) return false;
        
        // Load existing presets as an object
        var presetsContent = loadPresets();
        var presets = {};
        
        try {
            presets = parseJSON(presetsContent);
        } catch (e) {
            // If parsing fails, start with an empty object
            presets = {};
        }
        
        // Add or update the preset
        presets[presetName] = settings;
        
        // Save the updated file with proper formatting
        var presetsFile = new File(scriptPath + "/projectPresets.json");
        presetsFile.open('w');
        presetsFile.write(JSON.stringify(presets, null, 2)); // Use 2 spaces for indentation
        presetsFile.close();
        
        alert("Preset '" + presetName + "' saved successfully!");
        return true;
    } catch (e) {
        alert("Error saving preset: " + e.toString());
        return false;
    }
}

// Función para actualizar la lista de presets en el DropDownList
function updatePresetList(dropDown) {
    try {
        var presets = loadPresets();
        
        // Limpiar la lista actual
        dropDown.removeAll();
        
        // Añadir opción por defecto
        dropDown.add('item', 'Select Preset...');
        
        // Añadir presets guardados
        if (presets) {
            for (var presetName in presets) {
                if (presets.hasOwnProperty(presetName)) {
                    dropDown.add('item', presetName);
                }
            }
        }
        
        // Seleccionar la primera opción
        dropDown.selection = 0;
        
    } catch (e) {
        alert("Error updating preset list: " + e.toString());
    }
}

// Función para cargar los valores de un preset
function loadPresetValues(presetName, panel) {
    try {
        var presets = loadPresets();
        if (!presets || !presets[presetName]) return;
        
        var settings = presets[presetName];
        
        // Actualizar valores en la interfaz
        panel.dimensionsGroup.widthInput.text = settings.width;
        panel.dimensionsGroup.heightInput.text = settings.height;
        panel.durationGroup.fpsGroup.fpsInput.text = settings.fps;
        
        // Actualizar FPS en la lista desplegable si coincide con un valor preestablecido
        var fpsList = panel.durationGroup.fpsGroup.fpsList;
        fpsList.selection = 0; // Reset selection
        for (var i = 0; i < fpsList.items.length; i++) {
            if (fpsList.items[i].text === settings.fps.toString()) {
                fpsList.selection = i;
                break;
            }
        }
        
        panel.durationGroup.timeGroup.hoursInput.text = settings.hours || "0";
        panel.durationGroup.timeGroup.minutesInput.text = settings.minutes || "0";
        panel.durationGroup.timeGroup.secondsInput.text = settings.seconds || "0";
        panel.compsGroup.compsInput.text = settings.numComps;
        panel.foldersGroup.foldersInput.text = settings.folders.join('\n');
        panel.savePresetGroup.presetNameInput.text = presetName;
        
    } catch (e) {
        alert("Error loading preset values: " + e.toString());
    }
}

// Función para eliminar un preset
function deletePreset(presetName) {
    try {
        var scriptPath = getScriptPath();
        if (!scriptPath) return;
        
        var presetsFile = new File(scriptPath + "/projectPresets.json");
        if (!presetsFile.exists) return;
        
        // Cargar presets existentes
        presetsFile.open('r');
        var content = presetsFile.read();
        presetsFile.close();
        
        var presets = parseJSON(content);
        
        // Eliminar el preset seleccionado
        if (presets.hasOwnProperty(presetName)) {
            delete presets[presetName];
            
            // Guardar los presets actualizados
            presetsFile.open('w');
            presetsFile.write(JSON.stringify(presets, null, 2));
            presetsFile.close();
            
            alert("Preset '" + presetName + "' deleted successfully!");
            return true;
        }
        
        return false;
    } catch (e) {
        alert("Error deleting preset: " + e.toString());
        return false;
    }
}

// Función para mostrar la ubicación de los presets
function showPresetsLocation() {
    var scriptPath = getScriptPath();
    if (scriptPath) {
        var jsonFile = new File(scriptPath + "/projectPresets.json");
        try {
            if ($.os.indexOf("Windows") !== -1) {
                system.callSystem('explorer /select,"' + jsonFile.fsName + '"');
            } else {
                system.callSystem('open -R "' + jsonFile.fsName + '"');
            }
            return "success";
        } catch (e) {
            alert("Could not open presets location.");
            return "error";
        }
    }
    return "error";
}

// Nueva función para crear carpetas y composiciones por defecto
function createDefaultSetup(aspectRatio) {
    app.beginUndoGroup("Create Default Setup");
    
    try {
        // Definir dimensiones según aspect ratio
        var compWidth, compHeight;
        if (aspectRatio === "16:9") {
            compWidth = 1920;
            compHeight = 1080;
        } else if (aspectRatio === "1:1") {
            compWidth = 1080;
            compHeight = 1080;
        } else if (aspectRatio === "4:3") {
            compWidth = 1600;
            compHeight = 1080;
        } else {
            alert("Aspect ratio not supported.");
            return "invalid_ratio";
        }

        // Crear carpetas
        var folders = ["Comps", "Main Comps", "Materials", "Clips", "Episodes"];
        var createdFolders = {};

        for (var i = 0; i < folders.length; i++) {
            var folderName = folders[i];
            var existingFolder = null;
            for (var j = 1; j <= app.project.numItems; j++) {
                if ((app.project.item(j) instanceof FolderItem) && (app.project.item(j).name === folderName)) {
                    existingFolder = app.project.item(j);
                    break;
                }
            }
            if (!existingFolder) {
                createdFolders[folderName] = app.project.items.addFolder(folderName);
            } else {
                createdFolders[folderName] = existingFolder;
            }
        }

        // Seleccionar la carpeta Main Comps para las composiciones principales
        var mainCompsFolder = createdFolders["Main Comps"];

        // Crear composiciones principales
        var mainCompsToCreate = ["Comp 1", "Comp 2", "Comp 3"];
        for (var m = 0; m < mainCompsToCreate.length; m++) {
            var compName = mainCompsToCreate[m];
            // Verificar si ya existe una composición con este nombre
            var compExists = false;
            for (var n = 1; n <= app.project.numItems; n++) {
                if ((app.project.item(n) instanceof CompItem) && (app.project.item(n).name === compName)) {
                    compExists = true;
                    break;
                }
            }
            if (!compExists) {
                var newComp = app.project.items.addComp(compName, compWidth, compHeight, 1, 60, 30);
                newComp.parentFolder = mainCompsFolder;
            }
        }

        alert("Default setup created with aspect ratio: " + aspectRatio);
        return "success";
    } catch (e) {
        alert("Error creating default setup: " + e.toString());
        return "error";
    }
    
    app.endUndoGroup();
}

// Función para mostrar alertas de selección de preset
function showPresetSelectionAlert(action) {
    if (action === "load") {
        alert("Please select a preset to load.");
    } else if (action === "delete") {
        alert("Please select a preset to delete.");
    }
    return "alerted";
}