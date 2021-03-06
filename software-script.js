    class point{
        ligacoes = []
        forcasExternas = []
        yOffset = 0

        constructor(coordX,coordY,name,apoioFixo,apoioMovel)
        {
            this.coordX = coordX;
            this.coordY = coordY;
            this.name = name;
            this.apoioFixo = apoioFixo;
            this.apoioMovel = apoioMovel;
        }

        inserirLigacao(ponto)
        {
            this.ligacoes.push(ponto);
        }

        setYoffset(ofsset)
        {
            this.yOffset = ofsset;
        }

        inserirForca(vetor)
        {
            this.forcasExternas.push(vetor);
        }
        
    }


    class line{

        constructor(startPoint,EndPoint)
        {
            this.tipoPerfil = 'quadrado';
            this.forca = 0;
            this.deformacaoLong = 0;
            this.deformcaoTrans = 0;
            this.largura = 0;
            this.tensaoElastica = 0;
            this.tensaoRuptura = 0;
            this.Elasticidade = 0;
            this.coefV = 0;
            this.EndPoint = EndPoint;
            this.startPoint = startPoint;
        }
    }

    class vector{
        constructor(intensidade,angulo,sentido)
        {
            this.i = (intensidade*math.cos(((angulo*math.PI)/180)));
            this.j = (intensidade*math.sin(((angulo*math.PI)/180)));
            this.modulo = intensidade;
            this.angulo = ((angulo*Math.PI)/180);
            this.sentido = sentido;
        }
    }


    class forceDrawn{
        constructor(pontoInicial,coordXFinal,coordYFinal,modulo,vetor)
        {
            this.pontoInicial = pontoInicial;
            this.coordXFinal = coordXFinal;
            this.coordYFinal = coordYFinal;
            this.modulo = modulo;
            this.vetor = vetor;
        }
    }

    var count = 0;
    var distancia = 0;
    var angulo = 0;
    var lastPoint = 0x40;

    var escala = 1;
    var gridScale = 1;
    var flagApoiosInseridos = false;
    var c,ctx,canvas1,ctx1,apoioFixoImg,apoioMovelImg
    var gridEnabled = false;

    var manualInsertionParams = {
        enabled:false,
        firstPointInserted:false,
        firstPointX: 0,
        lastPointX:0,
        newPoints:true
    }

    var points = [];
    var lines = [];
    const vetores = [];
    const ImgSize = {x:50,y:50}
    const raio = 8;
    const forcasDesenhadas = [];

    var yOffset = 0;
    var inputMode = "polar";

    var distancia_apoios

    var CanvasWidth,CanvasHeigth;

  


    function ajustCanvasSize()
    {
        if(window.innerWidth < 900)
        {
            CanvasWidth  = (window.innerWidth)*0.8;
            CanvasHeigth =   (window.innerHeight)*0.92;
        }
        else
        {
            CanvasWidth  = (window.innerWidth)*0.6;
            CanvasHeigth =   (window.innerHeight)*0.92;
        }
    }


    function init()
    {
        c = document.getElementById("canvas-workspace");
        ctx = c.getContext("2d");

        ajustCanvasSize();

        ctx.canvas.width  = CanvasWidth;
        ctx.canvas.height = CanvasHeigth;

        apoioFixoImg = document.getElementById("apoioFixoImg-test");
        apoioMovelImg = document.getElementById("apoioMovelImg-test")

        var button = document.getElementById('btn-insert-point');
        var buttonInsertFixed = document.getElementById('btn-fixed-support');
        var buttonCalcular = document.getElementById("btn-calcular");
        var buttonInserirForca = document.getElementById("btn-forca");
        var buttonRedraw = document.getElementById("btn-draw-grids");
        var gridDistance = document.getElementById("grid-distance");
        var infoButton = document.getElementById("info-btn");
    

        infoButton.onclick = () =>{
            infoModal = document.getElementById('info-modal');

            infoModal.style = "display: block;";

            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function(event) {
            if (event.target === infoModal) {
                infoModal.style.display = "none";
            }
        }

        }

    
        var btnlogin = document.getElementById('btn-login');
        btnlogin.onclick = () =>{
            var user = document.getElementById("user-input").value; 
            var psw =  document.getElementById("psw-input").value;

            if((user === "EC4") && (psw === "EC4"))
            {
                document.getElementById("login-container").classList.add("hidden");
                document.getElementById("main-container").classList.remove("hidden");
            }
            else{
                alert('Credenciais incorretas');
            }

        }

        //input mode
        var selectInputMode = document.getElementById("select-input-mode");

        selectInputMode.onchange = function(event){

            inputMode = event.target.value;

            distanceInput = document.getElementById("distance-input");
            anguleInput = document.getElementById("angle-input");

            distanceInput.value = "";
            anguleInput = "";

            if(inputMode === "polar")
            {
                distanceInput.placeholder = "Distancia";
                anguleInput.placeholder = "Angulo";
            }
            else{
                distanceInput.placeholder = "Distancia X";
                anguleInput.placeholder = "Distancia Y";
            }
        }


        button.onclick = function(){
            //valida os campos de distancia e angulo
            var angule = document.getElementById('angle-input').value;
            var distance = document.getElementById('distance-input').value;
            var originPoint = document.getElementById('pontos-de-referencia').value;

            if(inputMode === "polar")
            {
                if((angule) && (angule>=0) && (angule<=360))
                {
                    if(distance)
                    {
                        if(originPoint)
                        {
                            //get point
                            selectedPoint = getPointFromName(originPoint);
                            
                            //calculate coords
                            xCoord = ((escala*(distance*math.cos(((angule*math.PI)/180))) + selectedPoint.coordX));
                            yCoord = ((escala*(distance*math.sin(((angule*math.PI)/180))) - selectedPoint.coordY));

                            if(yCoord < 0)
                            {
                                yCoord*=-1;
                            }

                            realizaLigação(selectedPoint.name,insertPoint(xCoord,yCoord,false,false));

                        }
                        else{
                            alert("Selecione uma origem válida");
                        }
                    }
                    else{
                        alert("Insira uma distância válida");
                    }
                }
                else{
                    alert("Insira um valor de ângulo válido");
                }
            }
            else //modo incremental
            {
                if(angule)
                {

                    if(distance)
                    {

                        if(originPoint)
                        {
                            //get point
                            selectedPoint = getPointFromName(originPoint);
                            
                            //calculate coords
                            xCoord = ((escala*(distance) + selectedPoint.coordX));
                            yCoord = ((escala*(angule) - selectedPoint.coordY));

                            if(yCoord < 0)
                            {
                                yCoord*=-1;
                            }

                            realizaLigação(selectedPoint.name,insertPoint(xCoord,yCoord,false,false));

                        }
                        else{
                            alert("Selecione uma origem válida");
                        }

                    }
                    else
                    {
                        alert("Insira uma distância X válida");
                    }


                }
                else{
                    alert("Insira uma distância Y válida");
                }
            }

        };

        buttonCalcular.onclick = function(){

            retorno = true;
            //verifica se os pontos possuem conexões em aberto
            points.forEach(point=>{
                
                if(((point.ligacoes.length <= 1) && (!point.apoioFixo && !point.apoioMovel)) || (point.ligacoes.length == 0))
                {
                    alert(`O ponto ${point.name} não possui conexões suficientes`);
                    retorno = false;
                }
            })
            if(!retorno)
            {
                return;
            }


            //verfica se é possivel montar a matriz
            if((lines.length+3) <= (points.length*2))
            {
                //limpa o canvas
                clearCanvas(ctx,c);

                //desenha redesenha o grid se o mesmo já foi habilitado antes
                if(gridEnabled)
                {
                    drawGrids();
                }

                //redesenha a tela
                reDraw();

                //Faz o calculo da matriz
                resultadoCalculo = calculo(lines,points,escala);
                drawReactions(resultadoCalculo);

                showForces(resultadoCalculo);

                drawSubitules();

            }
            else{
                
                alert('A treliça desenhada não é isoestática');
            }
        }



        buttonInsertFixed.onclick = function(){showModalDistancia()};


        c.addEventListener("mousedown", function (e) {

            if(!manualInsertionParams.enabled)
            {
                pontoVerificado = verificaClickNoPonto(e);

                if(pontoVerificado.estaContido)
                {
                    showModalPoint(pontoVerificado.point);
                }
                else{

                    if(flagApoiosInseridos)
                    {
                        var m = confirm("Deseja Inserir o ponto?");
                        if(m)
                        {
                            showModalPoint(insertPoint((e.clientX - c.offsetLeft),((e.clientY - c.offsetTop)+yOffset)));
                        }
                    }
                    else{
                        alert("É necessário inserir os apoios antes");
                    }
                }
            }
            else{
                //cadastrando apoios de forma manual
                if(!manualInsertionParams.firstPointInserted)
                {
                    manualInsertionParams.firstPointX =  (e.clientX - c.offsetLeft);
                    manualInsertionParams.firstPointInserted = true;

                    alert("Selecione na tela a posição do segundo ponto de apoio");

                }
                else{
                    manualInsertionParams.lastPointX = (e.clientX - c.offsetLeft);
                    manualInsertionParams.enabled = false;
                    flagApoiosInseridos = true;

                    //libera os botões
                     button.disabled = false;
                     buttonCalcular.disabled = false;
                     buttonInserirForca.disabled = false;
                     buttonRedraw.disabled = false;
                     gridDistance.disabled = false;

                    clearCanvas(ctx,c);

                    drawSupportPoint(manualInsertionParams);
                }
            }
            
          
           
        }, false);

        buttonInserirForca.onclick = function(){
            showModalForca();
        }


        //botão de redesenhar grid
        buttonRedraw.onclick = function(){

            //gridDistance
            if((gridDistance.value) && (gridDistance.value>0))
            {
                gridScale = gridDistance.value;
                if(!gridEnabled)
                {
                    gridEnabled = true;
                }
                drawGrids();
                
                reDraw();

            }
            else{
                alert("Insira uma distancia válida");
            }

        }
        
        //atualiza o offset da altura
        window.onscroll = function(e) {
            yOffset = document.body.scrollTop;
        };

        /*
        //evento de alterção de tamanho da tela
        window.onresize = function(e){

            CanvasWidth  = (window.innerHeight)*0.92;

            c = document.getElementById("canvas-workspace");
            ctx = c.getContext("2d");
            
            ctx.canvas.width  = CanvasWidth;
            ctx.canvas.height = CanvasHeigth;
 
        }*/

        window.addEventListener("orientationchange", function(event) {

            var offSetY = 0;
            var lastCanvasWidth = CanvasWidth;

            CanvasWidth = CanvasHeigth;
            CanvasHeigth = lastCanvasWidth;

            ctx.canvas.width = CanvasWidth;
            ctx.canvas.height = CanvasHeigth;


            if(points[0])
            {

                //inverte os pontos
                for(var a = 0; a< points.length; a++)
                {
                    
                    lastX = points[a].coordX;
                    lastY = points[a].coordY;

                    if(a === 0)
                    {
                        offSetY = (((CanvasHeigth - ImgSize.y) - ((points[a].coordY*CanvasHeigth)/CanvasWidth)))
                    }
                    if(lastCanvasWidth < CanvasWidth)
                    {
                        //se contiver offsetY
                        if(points[a].yOffset)
                        {
                            //remove offset
                            points[a].setYoffset(0);
                            points[a].coordY -= points[a].yOffset
                        }
                     

                        points[a].coordX = ((points[a].coordX*CanvasWidth)/CanvasHeigth);
                        points[a].coordY = ((points[a].coordY*CanvasHeigth)/CanvasWidth);

                        if(!points[a].yOffset)
                        {
                            points[a].setYoffset(offSetY);
                        }

                        points[a].coordY += points[a].yOffset;



                    }
                    else{

                        //se contiver offsetY
                        if(points[a].yOffset)
                        {
                            //remove offset
                            points[a].setYoffset(0);
                            points[a].coordY -= points[a].yOffset
                        }

                        points[a].coordX = ((points[a].coordX*CanvasWidth)/CanvasHeigth);
                        points[a].coordY = ((points[a].coordY*CanvasHeigth)/CanvasWidth);

                        if(!points[a].yOffset)
                        {
                            points[a].setYoffset(offSetY);
                        }

                        points[a].coordY += points[a].yOffset;

                    }
               
                }

                calculaEscala();

                clearCanvas(ctx,c);
                reDraw();
            }


        });
    }

    function containsPoint(point)
    {
        var status = false
        points.forEach(ponto =>{
            if(ponto.name === point.name)
            {
                status = true;
                return;
            }
        })

        return status;
    }


    function reDraw()
    {

    

            //redesenha as barras
            for(var i = 0; i < lines.length; i++)
            {
                if(lines[i])
                {
                    if(containsPoint(lines[i].startPoint) && containsPoint(lines[i].EndPoint))
                    {
                        drawLine(lines[i].startPoint,lines[i].EndPoint,true);
                    }
                    else
                    {
                        lines.splice(i,1);
                        i--;

                    }
                }
              
            }  


            suportPointParams = {firstPointX:"",firstPointY:"",lastPointX:"",lastPointY:"",newPoints:false}

            //redesenha os pontos
            points.map(point =>{
            if(point.apoioFixo && point.name==="A")
            {
                suportPointParams.firstPointX = point.coordX;
                suportPointParams.firstPointY = point.coordY;
            }
            else if(point.apoioMovel && point.name==="B")
            {
                suportPointParams.lastPointX = point.coordX;
                suportPointParams.lastPointY = point.coordY;
            }

            drawPoint(point)
            })

            ctx.beginPath();

            //re-desenha as linhas de forças
            forcasDesenhadas.map(forca =>{
            canvas_arrow(ctx,forca.pontoInicial.coordX,forca.pontoInicial.coordY,forca.coordXFinal,forca.coordYFinal);

            //vetor = new vector(forca.modulo,forca.vetor.angulo)

            insertForceLabel(forca.modulo,forca.pontoInicial,forca.vetor);

            })

            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.stroke();

            drawSupportPoint(suportPointParams)
    }

    function showForces(resultadoCalculo)
    {
    
        var forcaCalculadaList = document.getElementById("forcas-calculadas");

            //insert point in list
        var ul = document.getElementById("point-list");

        forcaCalculadaList.classList.remove('hidden');

        while(1)
        {
            var li = ul.lastElementChild;
            if(li)
            {
                ul.removeChild(li);
            }
            else{
                break;
            }
        }
           
    
        for(var b = 0; b < resultadoCalculo[0].length;b++)
        {
            li = document.createElement("li");
            li.appendChild(document.createTextNode(`F${resultadoCalculo[0][b]} = ${resultadoCalculo[1][b]} N`));
            ul.appendChild(li);
        }

        
    }

    function drawReactions(resultadoCalculado)
    {
        //preenche as linhas com as respectivas forcas
        for(var d = 3; d < resultadoCalculado[0].length; d++)
        {
           canvas = document.getElementById("canvas-workspace");
           mctx = canvas.getContext("2d");
           mctx.beginPath();
           nomeDaReacao = resultadoCalculado[0][d].substring(0,2);
           
            lines.map(line =>{
                if((nomeDaReacao.indexOf(line.startPoint.name) >= 0) && (nomeDaReacao.indexOf(line.EndPoint.name) >= 0))
                {
                    line.forca = resultadoCalculado[1][d];

                    //alterar a linha desenhada
                    mctx.moveTo(line.startPoint.coordX,line.startPoint.coordY);
                    mctx.lineTo(line.EndPoint.coordX, line.EndPoint.coordY);

                    mctx.lineWidth = 2;
        

                     if(line.forca > 0) //tracao azul
                    {
                        mctx.strokeStyle = "blue";

                    }
                    else if(line.forca < 0){
                        mctx.strokeStyle = "green";
                    }
                    else{
                        mctx.strokeStyle = "black";
                    }
                    mctx.stroke();

                }
            })

        }
    }


    function drawGrids(){


        limitX = CanvasWidth;
        stCordY = CanvasHeigth;
        passo = (gridScale*escala);
        
        startX = 0;

        if(points[0]) //se o ponto A já foi cadastrado
        {
            startX = points[0].coordX;

        }
        else{

            startX = limitX*0.375
        }
        startY = (stCordY-ImgSize.y)


        clearCanvas(ctx,c);

        //desenhar linha em "A"
        ctx.moveTo(startX , 0);
        ctx.lineTo(startX, stCordY);


        //linhas para a direita do ponto A
        for (var x = startX; x <= limitX; x += passo){
            ctx.moveTo(x + passo , 0);
            ctx.lineTo(x + passo, stCordY);
        }

        //linhas para a esquerda do ponto A
        for (var x = startX; x >= 0; x -= passo){
            ctx.moveTo(x - passo , 0);
            ctx.lineTo(x - passo, stCordY);
        }


        //linhas abaixo de A
        for (var x = startY; x <= CanvasHeigth; x += passo) {
            ctx.moveTo(0, x + passo);
            ctx.lineTo((limitX),x + passo);
        }

         //linhas acima de A
         for (var x = startY; x >= 0; x -= passo) {
            ctx.moveTo(0, x);
            ctx.lineTo((limitX),x);
        }

        ctx.strokeStyle = "black";
        ctx.lineWidth = 0.2;
        ctx.stroke();
    }


    function getPointFromName(name)
    {
        returnedPoint = null;
        points.forEach(point=>{
            if(point.name === name)
            {
                returnedPoint = point;
                return;
            }
        })

        return returnedPoint;
    }

    function verificaClickNoPonto(e)
    {
        posXClicked = e.clientX - c.offsetLeft;
        posYClicked = e.clientY - c.offsetTop;

        //insere o ofsset de scroll
        posYClicked+=yOffset;

        console.log(`Clicou: ${posXClicked} - ${posYClicked}`);

        retornoDaFuncao = {
            estaContido: false,
            point: null
        }

        points.forEach(point => {
            //Verificar no eixo X
            if((point.coordX+raio >= posXClicked) && (point.coordX-raio <= posXClicked))
            {
                if((point.coordY+raio >= posYClicked) && (point.coordY-raio <= posYClicked))
                {
                    retornoDaFuncao.estaContido = true;
                    retornoDaFuncao.point = point;
                }
            }
        });

        return retornoDaFuncao;
    }


    function drawPoint(ponto)
    {
        ctx.beginPath();
        ctx.strokeStyle = "black";
        //ctx.arc(ponto.coordX, (ponto.coordY + ponto.yOffset), raio, 0, 2 * Math.PI, true);
        ctx.arc(ponto.coordX, ponto.coordY, raio, 0, 2 * Math.PI, true);

        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fill();

        ctx.font = "24px Arial";
        ctx.fillStyle = "red";
        //ctx.fillText(ponto.name, (ponto.coordX+raio), ((ponto.coordY + ponto.yOffset)+raio));
        ctx.fillText(ponto.name, (ponto.coordX+raio), (ponto.coordY+raio));

    }

    function drawSubitules()
    {

        //desenhar o box azul
        x = (CanvasHeigth/96)
        y = (2*CanvasHeigth/48);

        //limpa a área que deve receber a legenda
        ctx.beginPath();
        ctx.rect(x,y,(x + (1.5*(CanvasHeigth/48)) + ctx.measureText("Compressão").width),(32+(CanvasHeigth/48)+y))
        ctx.fillStyle = "white"
        ctx.fill();

    

        ctx.beginPath();
        ctx.rect(x,y,(CanvasHeigth/48),(CanvasHeigth/48));
        ctx.fillStyle = "blue";
        ctx.fill();

        ctx.font = "16px Arial";
        ctx.fillText("Tração",x + 1.5*(CanvasHeigth/48),y+(CanvasHeigth/48));


        //desenhar o box verde
        y += 2*(CanvasHeigth/48);
    
        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.rect(x,y,(CanvasHeigth/48),(CanvasHeigth/48));
        ctx.fill();

        ctx.font = "16px Arial";
        ctx.fillText("Compressão",x + 1.5*(CanvasHeigth/48),y+(CanvasHeigth/48));


    }

    function calculaEscala(invertido)
    {
        if(!invertido)
        {
            escala = ((points[1].coordX - points[0].coordX)/distancia_apoios);
        }
        else{
            escala = ((points[1].coordY - points[0].coordY)/distancia_apoios);
        }
        console.log(`A escala atual é: ${escala}`);
    }

    function insertPoint(coordX,coordY,apoioFixo,apoioMovel)
    {
        console.log(`Insert Point -- X: ${coordX} -- Y:${coordY}`);
        var ponto = new point(coordX,coordY,String.fromCharCode(++lastPoint),apoioFixo,apoioMovel);
        drawPoint(ponto);

        points.push(ponto);
        
        //insert point in list
        var referenceSelect = document.getElementById("pontos-de-referencia");
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(`${ponto.name}`));
        referenceSelect.appendChild(option);

         //insert point in list
         var referenceSelect = document.getElementById("select-point");
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(`${ponto.name}`));
        referenceSelect.appendChild(option);


        return ponto;
    }

    function drawLine(startPoint,EndPoint,mantemListaOriginal){
    
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.moveTo(startPoint.coordX, startPoint.coordY);
        ctx.lineTo(EndPoint.coordX,EndPoint.coordY);  // 2x^2 + 4x + 2 = 75

        ctx.lineWidth = 1;
        ctx.stroke();

        if(!mantemListaOriginal)
        {
            lines.push(new line(startPoint,EndPoint));
        }


        /*const a = [[3, 2,-1], [1,3,1], [2,2,-2]]; //3x^2 + 2x -1 = 0;  1x^2 + 3x +1 = 1; 2x^2 + 2x - 2 = 2
        const b = [0,1,2];
        const x = math.lusolve(a, b);*/

    }


    function showModalForca(){
        
        resetModal();

        var modal = document.getElementById("myModal");

        var buttonConfirmar = document.getElementById("btConfirmarDistancia");
        var intensidadeInput = document.getElementById("input-intensidade");
        var anguloInput = document.getElementById("input-angulo-forca");
        var selectPoint = document.getElementById("select-point");

        var canvas = document.getElementById("canvas-preview");
        contexto = canvas.getContext("2d");

        contexto.canvas.width  = (CanvasWidth/2);
        contexto.canvas.height = (CanvasHeigth/2);

        document.getElementById("text-modal").innerHTML = "Inserir Força";
        document.getElementById("forca-container").style.display = "flex";


        modal.style.display = "block";

         // When the user clicks anywhere outside of the modal, close it
         window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        
        //on click "x" icon
        document.getElementById("close").onclick = function()
        {
            modal.style.display = "none";
        }

        anguloInput.onchange = function(e){

            clearCanvas(contexto,canvas);


            y = ((contexto.canvas.height/3)*math.sin(((e.target.value*math.PI)/180)))-(contexto.canvas.height/2);
            x =  ((contexto.canvas.height/3)*math.cos(((e.target.value*math.PI)/180)))+(contexto.canvas.width/2);

            if(y<0)
            {
                y*=-1;
            }

            canvas_arrow(contexto,(contexto.canvas.width/2),(contexto.canvas.height/2),x,y);

            contexto.stroke();
        }

        buttonConfirmar.onclick = function(){

            if(anguloInput.value)
            {
                if(selectPoint.value)
                {
                    if((intensidadeInput.value) && !(intensidadeInput.value < 0))
                    {
                        vetor = new vector(intensidadeInput.value,anguloInput.value)
                        ponto = getPointFromName(selectPoint.value);
                        ponto.inserirForca(vetor);

                        for(a = 0;a < points.length;a++)
                        {
                            if(points[a].name === ponto.name)
                            {
                                points[a] = ponto;
                            }
                        }


                        pontoFinalX = (ponto.coordX+(Math.cos(vetor.angulo) * CanvasWidth*0.08 ));
                        pontoFinalY = (ponto.coordY+(Math.sin(vetor.angulo*(-1))* CanvasWidth*0.08));

                        offsetX = false;
                        offsetY = false;

                        //verifica se é necessário dar o offset
                        ponto.ligacoes.map(pontoFinal => {


                            tangenteLinha = parseFloat(((pontoFinalY-ponto.coordY)/(pontoFinalX - ponto.coordX)).toFixed(3));
                            tangenteLigacao = parseFloat(((pontoFinal.coordY-ponto.coordY)/(pontoFinal.coordX-ponto.coordX)).toFixed(3));

                            tangenteLigacaoOposta = parseFloat(((pontoFinal.coordX-ponto.coordX)/(pontoFinal.coordY-ponto.coordY)).toFixed(3));


                            if((tangenteLigacao === tangenteLinha) || (tangenteLigacaoOposta === tangenteLinha))
                            {
                                //verifica se o sentido é o mesmo
                                if((((ponto.coordY-pontoFinalY) <= 0 && (ponto.coordY - pontoFinal.coordY) <= 0) || 
                                    ((ponto.coordY-pontoFinalY) >= 0 && (ponto.coordY - pontoFinal.coordY) >= 0)) &&
                                    (((ponto.coordX-pontoFinalX) >= 0 && (ponto.coordX - pontoFinal.coordX) >= 0) ||
                                     ((ponto.coordX-pontoFinalX) <= 0 && (ponto.coordX - pontoFinal.coordX) <= 0) ))
                                     {
                                       
                                        //offset apenas para angulos de 0, 90, 180 e 270
                                        
                                        if((tangenteLinha === 0) || (tangenteLinha === -0))
                                        {
                                            offsetX = true;    
                                        }
                                        else if((tangenteLinha === -Infinity) || (tangenteLinha === Infinity))
                                        {
                                            offsetY = true;
                                        }


                                     }
                            }

                            //close modal
                            modal.style.display = "none";

                        })

                        //desenha na tela o vetor forca
                        ctx.beginPath();

                        if(offsetX)
                        {

                            pontoFinalX = (ponto.coordX-(Math.cos(vetor.angulo) * CanvasWidth*0.08 ));
                            pontoFinalY = (ponto.coordY-(Math.sin(vetor.angulo*(-1))* CanvasWidth*0.08));

                            canvas_arrow(ctx,pontoFinalX,pontoFinalY,ponto.coordX,ponto.coordY);
                            forcasDesenhadas.push(new forceDrawn(ponto,pontoFinalX,pontoFinalY,intensidadeInput.value,vetor));

                        }
                        else if(offsetY)
                        {
                            pontoFinalX = (ponto.coordX-(Math.cos(vetor.angulo) * CanvasWidth*0.08 ));
                            pontoFinalY = (ponto.coordY-(Math.sin(vetor.angulo*(-1))* CanvasWidth*0.08));

                            canvas_arrow(ctx,pontoFinalX,pontoFinalY,ponto.coordX,ponto.coordY);
                            forcasDesenhadas.push(new forceDrawn(ponto,pontoFinalX,pontoFinalY,intensidadeInput.value,vetor));
                        }
                        else{

                            canvas_arrow(ctx,ponto.coordX,ponto.coordY,pontoFinalX,pontoFinalY);
                            forcasDesenhadas.push(new forceDrawn(ponto,pontoFinalX,pontoFinalY,intensidadeInput.value,vetor));
                        }

                        ctx.strokeStyle = "red";
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        insertForceLabel(intensidadeInput.value,ponto,vetor);
                        //retorna para 0º
                        //ctx.rotate((vetor.angulo*-1));
                        
                        //insere força no list
                        var forceContainer = document.getElementById("forces-list-conatinner");
                        forceContainer.classList.remove('hidden');

                        var forceAplicadaContainer = document.getElementById("forces-aplicadas");
                        forceAplicadaContainer.classList.remove('hidden');

                        var ul = document.getElementById("forces-list");
                        var li = document.createElement("li");

                        li.style="text-align:center; margin:0px auto 0px auto;";
                        li.appendChild(document.createTextNode(`Ponto: ${ponto.name} - Mod: ${intensidadeInput.value} N - ${anguloInput.value}°`));
                        ul.appendChild(li);

                    }
                    else{
                    } 
                }
                else{
                    alert("Selecione um ponto");
                }
                  
            }
            else{
                alert("Insira um angulo válido");
            }

        }

    }


    function insertForceLabel(intensidade,pontoInicial,vetor)
    {
        debugger;
        ctx.fillStyle = "#330033";
        ctx.font = "20px Arial";

        tamanhoTxt = {
            width:ctx.measureText(intensidade).width,
        }

        //coordenadas para inserir texto de apoio
        pontoFinalX = (pontoInicial.coordX+(Math.cos(vetor.angulo) * CanvasWidth*0.08));
        pontoFinalY = (pontoInicial.coordY+(Math.sin(vetor.angulo*(-1))* CanvasWidth*0.08));

        //centro da linha do vetor
        valX = ((pontoFinalX + pontoInicial.coordX)/2);
        valY = ((pontoFinalY+pontoInicial.coordY)/2);   
                        
        //coordenadas para inserir o texto
        var coordTextX = 0
        var coordTextY = 0;

        //ctx.fillText(intensidadeInput.value,valX ,valY);
        //ctx.rotate(vetor.angulo);
                        

        var anguloTexto = vetor.angulo;

        if(anguloTexto > (Math.PI/2) && anguloTexto <= Math.PI)
        {
                            
            /* valX = (ponto.coordX + (((pontoFinalX-ponto.coordX) - (tamanhoTxt.width))/2))+10;
            valY = ponto.coordY + (((pontoFinalY - ponto.coordY)/2) - 15);    */
            anguloTexto = ((Math.PI - anguloTexto )*-1);

            coordTextX = ((Math.cos(anguloTexto) * (tamanhoTxt.width/2))*-1);
            coordTextY = ((Math.sin(anguloTexto)*(tamanhoTxt.width/2))*-1);

        }
        else if(anguloTexto > (Math.PI) && anguloTexto <= Math.PI*1.5)
        {
            anguloTexo =  anguloTexto - Math.PI
        }
        else if(anguloTexto>(Math.PI*1.5) && (anguloTexto <= Math.PI*2)){
            anguloTexo =  anguloTexto - Math.PI*1.5
        }
        else{
                            
            valX = (pontoInicial.coordX + (((pontoFinalX - pontoInicial.coordX) - (tamanhoTxt.width))/2));
            valY = pontoInicial.coordY + (((pontoFinalY - pontoInicial.coordY)/2) - 2);      
        }

        //ctx.arc(valX, valY, 2, 0, 2 * Math.PI, true);
        //ctx.stroke();

        ctx.save();
        ctx.translate(valX+coordTextX,valY+coordTextY);

        ctx.rotate(anguloTexto);
        ctx.fillText(intensidade,0 ,0);
        ctx.restore();

    }

    function clearCanvas(context, canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        var w = canvas.width;
        canvas.width = 1;
        canvas.width = w;   
    }


    function canvas_arrow(context, fromx, fromy, tox, toy) {
        var headlen = 10; // length of head in pixels
        var dx = tox - fromx;
        var dy = toy - fromy;
        var angle = Math.atan2(dy, dx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    }

    function showModalDistancia(titulo,mensagem)
    {

        resetModal();
        var modal = document.getElementById("myModal");

        var buttonConfirmarDistancia = document.getElementById("btConfirmarDistancia");
        document.getElementById("text-modal").innerHTML = "Insira a distancia entre os pontos";


        modal.style.display = "block";

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        
        //on click "x" icon
        document.getElementById("close").onclick = function()
        {
            modal.style.display = "none";
        }


        //on click "x" icon
        document.getElementById("close").onclick = function()
        {
            modal.style.display = "none";
        }

        var buttonSuport = document.getElementById("btn-fixed-support");
        var distanceInput = document.getElementById("input-distance");

        distanceInput.style.display = "block"


        document.getElementById("auto-insertion-container").style.display = "block";
        
        var autoDistanceCB = document.getElementById("cb-distancia-auto");



        buttonConfirmarDistancia.onclick = function(){
        
            var valor = distanceInput.value;
            if((valor) && (valor>0))
            {

                if(autoDistanceCB.checked)
                {
                    modal.style.display = "none";
                    drawSupportPoint();
                    buttonSuport.disabled = true;
                    flagApoiosInseridos = true;
                    distancia_apoios = valor;
                    calculaEscala();
                }
                else{

                    manualInsertionParams.enabled = true;
                    manualInsertionParams.distanceInputed = valor;
                    modal.style.display = "none";
                    buttonSuport.disabled = true;
                    drawAuxRect();

                    //block buttons
                    document.getElementById('btn-insert-point').disabled = true;
                    document.getElementById('btn-fixed-support').disabled = true;
                    document.getElementById("btn-calcular").disabled = true;
                    document.getElementById("btn-forca").disabled = true;
                    document.getElementById("btn-draw-grids").disabled = true;
                    document.getElementById("grid-distance").disabled = true;

                    alert("Selecione na tela a posição do primneiro ponto");

                }
        

            }
            else{
                alert("Insira uma distância válida");
            }   
        }
        
    }


    function drawAuxRect(){

        ctx.beginPath();

        ctx.rect(0,0,CanvasWidth,(CanvasHeigth-ImgSize.y));
        ctx.fill();
    }



    function showModalPoint(ponto){

        resetModal();

        var modal = document.getElementById("myModal");

        var buttonConfirmarDistancia = document.getElementById("btConfirmarDistancia");
        var buttonApagarPonto = document.getElementById("btApagarPonto");

        document.getElementById("text-modal").innerHTML = "Selecione as conexões do ponto";
        document.getElementById("forca-container").style.display = "none";

        buttonConfirmarDistancia.style.display = "block";
        buttonApagarPonto.style.display ="block";

        modal.style.display = "block";

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
        if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        
        //on click "x" icon
        document.getElementById("close").onclick = function()
        {
            modal.style.display = "none";
        }

        var buttonConfirmar = document.getElementById("btConfirmarDistancia");
        var pointSelect = document.getElementById("select-available-points");

        pointSelect.style.display = "block"

        //insert point into modal points select
        points.forEach(point =>{
            
            existeLigacao = false;

            point.ligacoes.forEach(pontoLigado =>{

                if(pontoLigado.name === ponto.name)
                {
                    existeLigacao = true;
                }
            })

            if((!existeLigacao)&&(point.name !== ponto.name))
            {
                var option = document.createElement("option");
                option.appendChild(document.createTextNode(`${point.name}`));
                pointSelect.appendChild(option);
            }
     
        })

      

        buttonConfirmar.onclick = function(){

            modal.style.display = "none";

            //relação entre os pontos
            nomeDoPonto = pointSelect.value;

            realizaLigação(nomeDoPonto,ponto);
           

        }

        buttonApagarPonto.onclick = function(){

        
            for(a = 0; a< points.length; a++)
            {
                if(ponto.name === points[a].name)
                {
                   points.splice(a,1);
                   break;
                }

            }

            modal.style.display = "none";

            clearCanvas(ctx,c);
            reDraw();



        }
    }

    function realizaLigação(nomePontoOrigem,pontoNovo)
    {
           //encontra o ponto selecionado no dropdown
            pontoSelecionado = null;
            for(a = 0; a<points.length;a++)
            {
                if(points[a].name === nomePontoOrigem)
                {
                    pontoSelecionado = points[a];
                    points[a].inserirLigacao(pontoNovo);
                    break;
                }
            }

            pontoNovo.inserirLigacao(pontoSelecionado);

            //atualiza o ponto novo no array de pontos
            for(a = 0; a<points.length;a++)
            {
                if(points[a].name === pontoNovo.name)
                {
                    points[a] = pontoNovo;
                    break;
                }
            }

            drawLine(pontoNovo,pontoSelecionado);
    }

    function drawSupportPoint(params)
    {

        

        if(!params)
        {
            var janelaY = CanvasHeigth;
            var janelaX = CanvasWidth;
            //ponto de origem
            //ctx.moveTo((janelaX*0.25),janelaY);

            startImgX = ((janelaX*0.375)-((ImgSize.x)/2));
            startImgY = (janelaY-ImgSize.y);

            endImgX = ((janelaX*0.625)-((ImgSize.x)/2));


            ctx.drawImage(apoioFixoImg,startImgX,startImgY,ImgSize.x,ImgSize.y);

            insertPoint((janelaX*0.375),startImgY,true);


            //ponto final
            ctx.moveTo(endImgX,(janelaY-ImgSize.y));
            ctx.drawImage(apoioMovelImg,endImgX,startImgY,ImgSize.x,ImgSize.y);
        
            insertPoint((janelaX*0.625),startImgY,false,true);
        }
        else{
            
            startImgY = (CanvasHeigth-ImgSize.y);


            ctx.drawImage(apoioFixoImg,(params.firstPointX-(ImgSize.x/2)),startImgY,ImgSize.x,ImgSize.y);

            if(params.newPoints)
            {
                insertPoint(params.firstPointX,startImgY,true);
            }
        
            //ponto final
            ctx.moveTo(params.lastPointX,(janelaY-ImgSize.y));
            ctx.drawImage(apoioMovelImg,(params.lastPointX-(ImgSize.x/2)),startImgY,ImgSize.x,ImgSize.y);
        
            if(params.newPoints)
            {
                insertPoint(params.lastPointX,startImgY,false,true);
                distancia_apoios = manualInsertionParams.distanceInputed;
                calculaEscala();

            } 

        }
     
    }

    function setNewPoints()
    {
       let x =  (distancia * math.cos((angulo*math.PI)/180));
       let y =  ((distancia*math.sin((angulo*math.PI)/180)) *(-1)); //correct y coordenations
       return ([x,y]);
    }


    function resetModal()
    {
        document.getElementById("myModal").style.display = "none";
        document.getElementById("input-distance").style.display = "none";
        document.getElementById("select-available-points").style.display = "none";
        document.getElementById("forca-container").style.display = "none";
        document.getElementById("btConfirmarDistancia").onclick = null;
        document.getElementById("auto-insertion-container").style.display = "none";
        document.getElementById("auto-insertion-container").onclick = null;
        document.getElementById("btApagarPonto").style.display="none";
        const myNode = document.getElementById("select-available-points");

        while (myNode.firstChild) {
            myNode.removeChild(myNode.lastChild);
        }
    }
  