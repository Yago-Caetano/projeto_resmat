
    
var matriz = [];
    /* Convenção: 
        Verticais A e B :para cima;
        Horizontal A: direita;
        Referencia do Momento: Ponto A

        As 3 primeiras colunas são VA HA VB

        Momento POSITIVO = Sentido Horário

        Força sai do ponto
    */
var cabecalho = [];
var resultado = [];
var aux = [];
var colunas,linhas;



function calculo(lines,points,escala)
{

     matriz = [];
     aux = [];
     resultado = [];

    matrizRetorno = [[],[]];

     colunas = (lines.length+3);
     linhas = ((points.length*2)+3);

     //cria o esqueleto da matriz
     for(var a = 0; a< linhas; a++)
     {
         for(var b =0; b<colunas;b++)
         {
            aux.push(0);
         }
         matriz.push(aux);
         aux = [];
     }

     calcularVertical(points);

     calcularHorizontal(points);

     calcularMomento(points,escala);

     getReacoes(points,lines,escala);

     console.log(cabecalho);

     console.log("MATRIZ SEM REDUÇÃO");
     result = solve(matriz,resultado);

     console.log(result);


    //const formatcao = formataMatriz(matriz);
    //result = solve(formatcao.matrizFormatada,formatcao.resultadoFormatado);
     //result = math.lusolve(formatcao.matrizFormatada,formatcao.resultadoFormatado)

    
     for(var a = 0; a< cabecalho.length; a++)
     {
         result[a] = parseFloat(result[a].toFixed(5));
         matrizRetorno[0].push(cabecalho[a]);
         matrizRetorno[1].push(result[a]);
     }


     return matrizRetorno;


}

/*
    "Transforma" para matriz quadrada
*/
function formataMatriz()
{
    matrizFormatada = [];
    linhasParaExcluir = [];
    copiaZerosPorLinha = [];
    qtdParaRemover = 0;

    //verifica a quantidade de linhas
    var qtd = cabecalho.length;

    qtdZerosPorLinha = [];

    if(matriz.length !== qtd)
    {
        qtdParaRemover = (matriz.length - qtd);

        for(var a = 3; a<matriz.length;a++)
        {
            qtdZeros = 0;

            matriz[a].forEach(linha =>{
                if(linha === 0)
                {
                    qtdZeros++;
                }
            })

            qtdZerosPorLinha.push(qtdZeros);
        }
    }
  
    qtdZerosPorLinha.map(item =>{
        copiaZerosPorLinha.push(item);
    })


    qtdZerosPorLinha.sort(function(a,b){

        return a - b;

    });

    //verifica os indices dos registros que possuem a maior quantidade de zeros
    for(var b = (qtdZerosPorLinha.length-1); b > (qtdZerosPorLinha.length-(qtdParaRemover+1));b--)
    {
        for(var c = 0; c<copiaZerosPorLinha.length;c++)
        {
            if(copiaZerosPorLinha[c] === qtdZerosPorLinha[b])
            {
                if(linhasParaExcluir.indexOf(c+3) === -1)
                {
                    linhasParaExcluir.push(c+3);
                    break;
                }
              
            }
        }
    }

    matrizFormatada = matriz;
    resultadoFormatado = resultado
    for(var d = 0; d < linhasParaExcluir.length;d++)
    {
        matrizFormatada.splice(linhasParaExcluir[d],1);
        resultadoFormatado.splice(linhasParaExcluir[d],1);
    }

    return {matrizFormatada,resultadoFormatado};
}



function getReacoes(points,lines,escala)
{

    cabecalho = ['VA','HA','VB'];

    offset = 3;

    points.forEach(ponto=>{
        somaVertical = 0;
        somaHorizontal = 0;

        ponto.forcasExternas.forEach(forca=>{
            somaVertical+=forca.j;
            somaHorizontal+=forca.i;
        })


        if(ponto.apoioFixo)
        {
            matriz[offset][0] = 1;
            matriz[(offset+1)][1] = 1;
            
        }
        else if(ponto.apoioMovel)
        {
            matriz[offset][2] = 1;
        }


        ponto.ligacoes.forEach(ligacao =>{

            distanciaX = ((ligacao.coordX - ponto.coordX)/escala);
            distanciaY = (((ligacao.coordY - ponto.coordY)/escala)*(-1));

            var anguloRd,tangente;

            if(distanciaY === 0)
            {
                if(distanciaX>0)
                {
                    anguloRd = 0;
                }
                else{
                    anguloRd = Math.PI;
                }
            }

            else if(distanciaX === 0)
            {
                if(distanciaY>0)
                {
                    anguloRd = (Math.PI/2)
                }
                else{
                    anguloRd = (1.5 * Math.PI);
                }
            }
            else{

                tangente = (distanciaY/distanciaX);
                anguloRd = Math.atan(tangente);

                if(distanciaX < 0)
                {
                    anguloRd = (Math.PI - (anguloRd*(-1)));
                }
            }
            
        

            coeefForcaX = Math.cos(anguloRd);
            coeefForcaY = Math.sin(anguloRd);

            // define o nome da ligação
            nomeCompletoLigacao = `${ponto.name}${ligacao.name} - ${ligacao.name}${ponto.name}`;
            nomeLigacao = `${ponto.name}${ligacao.name}`;


            //verifica se o nome da ligacao já foi cadastrado no cabeçalho
            nomeCadastrado = false;
            indice = 0;
            
            for(var a = 0; a < cabecalho.length;a++)
            {
                if(cabecalho[a].indexOf(nomeLigacao) >= 0)
                {
                    indice = a;
                    nomeCadastrado = true;
                    break;
                }

            }

            if(!nomeCadastrado)
            {
                cabecalho.push(nomeCompletoLigacao);
                indice = (cabecalho.length-1);
            }

            matriz[offset][indice] = coeefForcaY;
            matriz[(offset+1)][indice] = coeefForcaX;
        })
        offset+=2;
        resultado.push((somaVertical*(-1)));
        resultado.push((somaHorizontal*(-1)));
    })
}

function calcularVertical(points){

    var soma = 0;

    points.forEach(ponto => {


        ponto.forcasExternas.forEach(forca=>{

            soma+=forca.j;
        })

    });
    

    matriz[0][0] = 1; //VA
    matriz[0][1] = 0; //HA
    matriz[0][2] = 1; //VB
    
    resultado.push(soma*(-1));

}

function calcularHorizontal(points){

    var soma = 0;

    points.forEach(ponto => {


        ponto.forcasExternas.forEach(forca=>{

            soma+=forca.i;
        })

    });
    

    matriz[1][0] = 0; //VA
    matriz[1][1] = 1; //HA
    matriz[1][2] = 0; //VB
    
    resultado.push(soma*(-1));
}

function calcularMomento(points,escala){

    var soma = 0;
    var refX = points[0].coordX;
    var refY = points[0].coordY;


    points.forEach(ponto => {

        if(ponto.name !== 'A')
        {
            ponto.forcasExternas.forEach(forca=>{

                distanciaX = (ponto.coordX - refX)/escala;
                distanciaY =  (((ponto.coordY - refY)/escala) *(-1)); //com a correção do canvas, adciona -1
                soma+=((distanciaX*forca.j*(-1)) + (distanciaY*forca.i));

            })
        }
    
    });
    

    matriz[2][0] = 0; //VA
    matriz[2][1] = 0; //HA
    matriz[2][2] = ((points[1].coordX - points[0].coordX)*(-1)/escala); //Vb -- Como temos o momento, deve-se colcoar a distancia na equação para que seja possivel determinar a força de Vertical no ponto B
    
    resultado.push(soma*(-1));

}