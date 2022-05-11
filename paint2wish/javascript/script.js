// les reglages de base 
let canvas;
let ctx;
let savedImageData;
let dragging = false;
let strokeColor = 'black';
let fillColor = 'black';
let line_Width = 2;
let triangleSides = 3;
let start_background_color = 'white';
// outil de base 
let currentTool = 'brush';
let canvasWidth = 1200;
let canvasHeight = 600; 
// Signalez qu'il s'agit de l'outil de bas
let usingBrush = false;
// les lignes en coordonnée et en abscisse
let brushXPoints = new Array();
let brushYPoints = new Array();
//la position de base
let brushDownPos = new Array();
 
// signalez les mouvemets de types elastique que va pouvoir notre brush grace a la souris 
class ShapeBoundingBox{
    constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
}
 
// retenir la position de la souris lors du clique
class MouseDownPos{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}
 
// retenir la localisation dans le canvas 
class Location{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}
 
// retenir la valeur en x et en y du triangle
class trianglePoint{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}
// retenir le tout dans des variables
let shapeBoundingBox = new ShapeBoundingBox(0,0,0,0);
let mousedown = new MouseDownPos(0,0);
let loc = new Location(0,0);
 
// fontion qui appel la page 
document.addEventListener('DOMContentLoaded', setupCanvas);
 
function setupCanvas(){
    // les references de mon canvas en fonction de l'id 
    canvas = document.getElementById('my-canvas');
    // reglage du canvas
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = line_Width;
    // dire au programme de reagir au click dans le canvas 
    canvas.addEventListener("mousedown", ReactToMouseDown);
    canvas.addEventListener("mousemove", ReactToMouseMove);
    canvas.addEventListener("mouseup", ReactToMouseUp);
}
// fonction qui me permet de changer d'outil apres un clique dessus 
function ChangeTool(toolClicked){
    document.getElementById("save").className = "";
    document.getElementById("brush").className = "";
    document.getElementById("line").className = "";
    document.getElementById("carré").className = "";
    document.getElementById("cercle").className = "";
    document.getElementById("triangle").className = "";
    document.getElementById(toolClicked).className = "selected";
    // change l'objet en cours d'utilisation apres un clique
    currentTool = toolClicked;
}
//rappel de la position de la souris dans le canvas
function GetMousePosition(x,y){
    // demander la taille du canvas sur la page web
    let canvasSizeData = canvas.getBoundingClientRect();
    return { x: (x - canvasSizeData.left) * (canvas.width  / canvasSizeData.width),
        y: (y - canvasSizeData.top)  * (canvas.height / canvasSizeData.height)
      };
}
//fonction qui me permet de save l'image tirée du canvas dans le default download directory grace a ces données  
function SaveCanvasImage(){
    // save l'iamge
    savedImageData = ctx.getImageData(0,0,canvas.width,canvas.height);
}
 // 1er ffonction qui permet de dessiner
function RedrawCanvasImage(){
    // Restore l'image
    ctx.putImageData(savedImageData,0,0);
}
// fonction qui me permet de calculer la taille des lignes tracer a la brush sur le canvas
function UpdateRubberbandSizeData(loc){
    shapeBoundingBox.width = Math.abs(loc.x - mousedown.x);
    shapeBoundingBox.height = Math.abs(loc.y - mousedown.y);

    if(loc.x > mousedown.x){
        shapeBoundingBox.left = mousedown.x;
    } else {
        shapeBoundingBox.left = loc.x;
    }

    if(loc.y > mousedown.y){
        shapeBoundingBox.top = mousedown.y;
    } else {
        shapeBoundingBox.top = loc.y;
    }
}
 
// fonction trouver sur internet pour le calcul des angles d'un polygon que j'ai adpaté a un triangle
function getAngleUsingXAndY(mouselocX, mouselocY){
    let adjacent = mousedown.x - mouselocX;
    let opposite = mousedown.y - mouselocY;
 
    return radiansToDegrees(Math.atan2(opposite, adjacent));
}
 
function radiansToDegrees(rad){
    if(rad < 0){

        return (360.0 + (rad * (180 / Math.PI))).toFixed(2);
    } else {
        return (rad * (180 / Math.PI)).toFixed(2);
    }
}
 
// suite de la fonction de calcul des angles
function degreesToRadians(degrees){
    return degrees * (Math.PI / 180);
}
 // suite de la fonction de calcul des angles pour calculer ceux du triangle 
function getTrianglePoints(){
    let angle =  degreesToRadians(getAngleUsingXAndY(loc.x, loc.y));
    let radiusX = shapeBoundingBox.width;
    let radiusY = shapeBoundingBox.height;
    let trianglePoints = [];
    for(let i = 0; i < triangleSides; i++){
        trianglePoints.push(new trianglePoint(loc.x + radiusX * Math.sin(angle),
        loc.y - radiusY * Math.cos(angle)));
        angle += 2 * Math.PI / triangleSides;
    }
    return trianglePoints;
}
 
function getTriangle(){
    let trianglePoints = getTrianglePoints();
    ctx.beginPath();
    ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
    for(let i = 1; i < triangleSides; i++){
        ctx.lineTo(trianglePoints[i].x, trianglePoints[i].y);
    }
    ctx.closePath();
}
 
// fonction qui me permet de dessiner reelment sur le canvas 
function drawRubberbandShape(loc){
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    if(currentTool === "brush"){
        // Creé un pinceau 
        DrawBrush();
    } else if(currentTool === "line"){
        // crée des Lignes
        ctx.beginPath();
        ctx.moveTo(mousedown.x, mousedown.y);
        ctx.lineTo(loc.x, loc.y);
        ctx.stroke();
    } else if(currentTool === "carré"){
        // Creé des carré
        ctx.strokeRect(shapeBoundingBox.left, shapeBoundingBox.top, shapeBoundingBox.width, shapeBoundingBox.height);
    } else if(currentTool === "cercle"){
        // Creé des cercle
        let radius = shapeBoundingBox.width;
        ctx.beginPath();
        ctx.arc(mousedown.x, mousedown.y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }  else if(currentTool === "triangle"){
        // Creé des triangles
        getTriangle();
        ctx.stroke();
    }
}
 
function UpdateRubberbandOnMove(loc){
// save du changement de taille et du changement de position
    UpdateRubberbandSizeData(loc);
    drawRubberbandShape(loc);
}
 
//save de chaque point de click laisser par la brush avec la souris
function AddBrushPoint(x, y, mouseDown){
    brushXPoints.push(x);
    brushYPoints.push(y);
    brushDownPos.push(mouseDown);
}

 
// rassemeblement des points pour en faire des lignes (fonction trouver sur internet)
function DrawBrush(){
    for(let i = 1; i < brushXPoints.length; i++){
        ctx.beginPath();
        if(brushDownPos[i]){
            ctx.moveTo(brushXPoints[i-1], brushYPoints[i-1]);
        } else {
            ctx.moveTo(brushXPoints[i]-1, brushYPoints[i]);
        }
        ctx.lineTo(brushXPoints[i], brushYPoints[i]);
        ctx.closePath();
        ctx.stroke();
    }
}

    
function ReactToMouseDown(e){
    // changer le style du curseur 
    canvas.style.cursor = "crosshair";
    // demande de la localisation de la souris au programme 
    loc = GetMousePosition(e.clientX, e.clientY);
    // Save 
    SaveCanvasImage();
    // Save de la position de la souris après chaque click 
    mousedown.x = loc.x;
    mousedown.y = loc.y;
    dragging = true;
 
    if(currentTool === 'brush'){
        usingBrush = true;
        AddBrushPoint(loc.x, loc.y);
    }
};
//suite
function ReactToMouseMove(e){
    canvas.style.cursor = "crosshair";
    loc = GetMousePosition(e.clientX, e.clientY);
 
    if(currentTool === 'brush' && dragging && usingBrush){
        if(loc.x > 0 && loc.x < canvasWidth && loc.y > 0 && loc.y < canvasHeight){
            AddBrushPoint(loc.x, loc.y, true);
        }
        RedrawCanvasImage();
        DrawBrush();
    } else {
        if(dragging){
            RedrawCanvasImage();
            UpdateRubberbandOnMove(loc);
        }
    }
};
//suite
function ReactToMouseUp(e){
    canvas.style.cursor = "default";
    loc = GetMousePosition(e.clientX, e.clientY);
    RedrawCanvasImage();
    UpdateRubberbandOnMove(loc);
    dragging = false;
    usingBrush = false;
}

//fonction qui permet de changer la taille des strokes
function changetaille(){
    taille = document.getElementById("taille").value;
    ctx.lineWidth =taille;
}
//fonction qui permet de choisir la couleur primaire 
function changecolor(){
    color= document.getElementById("color-primaire").value;
    ctx.strokeStyle = color;
}
// fonction qui permet de choisir la couleur secondaire
function changecolor2(){
    color = document.getElementById("color-secondaire").value;
    ctx.strokeStyle = color;
}
//fonction qui permet de généré une zone de texte 
function generetext(){
    text = document.getElementById("text_area").value;
    ctx.lineWidth = text;
}
 
// suite de la fonction qui permet de save le dessin sur le canvas dans le default download directory
function SaveImage(){
    // reference de l'lement
    var imageFile = document.getElementById("img-file");
    // attibut de l'image
    imageFile.setAttribute('download', 'image.png',);
    // Reference du canvas 
    imageFile.setAttribute('href', canvas.toDataURL());
}


// fonction pour reset le canvas 
function ResetImage(){
    ctx.fillStyle = start_background_color;
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillRect(0,0, canvas.width, canvas.height);
}