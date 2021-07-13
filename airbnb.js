//python -m http.server en el terminal para arrancar el servidor
//hacemos caso de la propiedad avgbedrooms (properties lo ignoramos)
//mejor crear dos lienzos en contenedores diferentes (div)
//el apto es válido dibujar el mapa con los colores en relación al precio medio y dibujar solo un barrio. Para nota sería relacionar al hacer click en el mapa con la gráfica de avgbedrooms
//features.0.properties.avgbedrooms

d3.json('practica_airbnb.json')
  .then((featureCollection) => {
      drawMaps(featureCollection);
    });

function drawMaps(featureCollection) {

    // MAPA CON LOS BARRIOS DE MADRID
    //y pintarlos por colores según el precio medio del alquiler en el barrio

//1. Datos GeoJSON
    console.log(featureCollection.features[0].properties.avgprice)
    //console.log(featureCollection.features)
    var width = 800;
    var height = 800;

    var svg = d3.select('div')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g');

    var center = d3.geoCentroid(featureCollection); //Encontrar la coordenada central del mapa (de la featureCollection)
    //var center_area = d3.geoCentroid(featureCollection.features[0]); //Encontrar la coordenada central de un area. (de un feature)

    //console.log(center)

    //2. Proyección de coordenadas [long, lat] en valores [x, y]
    var projection = d3.geoMercator()
        .fitSize([width, height], featureCollection) // equivalente a  .fitExtent([[0, 0], [width, height]], featureCollection). Sirve para calcularnos la escala automáticamente en función del lienzo que le pasamos (así no tenemos que poner scale(), center() ni translate() y empezar a probar).
        //.scale(1000)
        //Si quiero centrar el mapa en otro centro que no sea el devuelto por fitSize.
        .center(center) //centrar el mapa en una [long,lat] determinada. Si dijésemos que es SOL el centro, pues ponemos la latitud y longitud de la plaza de Sol.
        .translate([width / 2, height / 2]) //centrar el mapa en una posicion x,y determinada

    //console.log(projection([long,lat]))

    //3. Transformar los datos de entrada (coordenadas) en valores [x, y] que podamos pintar
    //Para crear paths a partir de una proyección 
    var pathProjection = d3.geoPath().projection(projection);
    //console.log(pathProjection(featureCollection.features[0]))
    var features = featureCollection.features;

    var createdPath = svg.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('d', (d) => pathProjection(d)) //pasamos todos los barrios para ponerlos como [x, y], pasándolo por la función pathProjection que he creado antes para realizar el cambio
        .attr("opacity", function(d, i) {
            d.opacity = 0.75;
            return d.opacity
        })
        .attr('stroke','#e9f2fa');

    createdPath.on('mouseover', HandleMouseOver);
    createdPath.on('mouseout', HandleMouseOut);

    //calculamos el máximo y mínimo de los precios medios de cada barrio
    var maxX = d3.max(featureCollection.features, function (d, i) {return d.properties.avgprice});
    var minX = d3.min(featureCollection.features, function (d) {return d.properties.avgprice});

    var nblegend = 10; //queremos 10 tramos de precios
    var nblegendTotal = nblegend + 1;
    var priceScale = (maxX - minX)/nblegend;

    //sacamos la leyenda a utilizar en función del número de tramos y los minimos y máximos
    var myScaledPrices = function (min, len, priceS){
        let a=["undefined"];
        let b=min;
        for (let i=1;i<=len;i++){
            a[i]="("+ b +" ; " + (b+priceS) + "]";
            b+=priceS;
        }
        return a;
    };
    
    //damos color
    var myColors = ["#f7fbff","#f6faff","#f5fafe","#f5f9fe","#f4f9fe","#f3f8fe","#f2f8fd","#f2f7fd","#f1f7fd","#f0f6fd","#eff6fc","#eef5fc","#eef5fc","#edf4fc","#ecf4fb","#ebf3fb","#eaf3fb","#eaf2fb","#e9f2fa","#e8f1fa","#e7f1fa","#e7f0fa","#e6f0f9","#e5eff9","#e4eff9","#e3eef9","#e3eef8","#e2edf8","#e1edf8","#e0ecf8","#e0ecf7","#dfebf7","#deebf7","#ddeaf7","#ddeaf6","#dce9f6","#dbe9f6","#dae8f6","#d9e8f5","#d9e7f5","#d8e7f5","#d7e6f5","#d6e6f4","#d6e5f4","#d5e5f4","#d4e4f4","#d3e4f3","#d2e3f3","#d2e3f3","#d1e2f3","#d0e2f2","#cfe1f2","#cee1f2","#cde0f1","#cce0f1","#ccdff1","#cbdff1","#cadef0","#c9def0","#c8ddf0","#c7ddef","#c6dcef","#c5dcef","#c4dbee","#c3dbee","#c2daee","#c1daed","#c0d9ed","#bfd9ec","#bed8ec","#bdd8ec","#bcd7eb","#bbd7eb","#b9d6eb","#b8d5ea","#b7d5ea","#b6d4e9","#b5d4e9","#b4d3e9","#b2d3e8","#b1d2e8","#b0d1e7","#afd1e7","#add0e7","#acd0e6","#abcfe6","#a9cfe5","#a8cee5","#a7cde5","#a5cde4","#a4cce4","#a3cbe3","#a1cbe3","#a0cae3","#9ec9e2","#9dc9e2","#9cc8e1","#9ac7e1","#99c6e1","#97c6e0","#96c5e0","#94c4df","#93c3df","#91c3df","#90c2de","#8ec1de","#8dc0de","#8bc0dd","#8abfdd","#88bedc","#87bddc","#85bcdc","#84bbdb","#82bbdb","#81badb","#7fb9da","#7eb8da","#7cb7d9","#7bb6d9","#79b5d9","#78b5d8","#76b4d8","#75b3d7","#73b2d7","#72b1d7","#70b0d6","#6fafd6","#6daed5","#6caed5","#6badd5","#69acd4","#68abd4","#66aad3","#65a9d3","#63a8d2","#62a7d2","#61a7d1","#5fa6d1","#5ea5d0","#5da4d0","#5ba3d0","#5aa2cf","#59a1cf","#57a0ce","#569fce","#559ecd","#549ecd","#529dcc","#519ccc","#509bcb","#4f9acb","#4d99ca","#4c98ca","#4b97c9","#4a96c9","#4895c8","#4794c8","#4693c7","#4592c7","#4492c6","#4391c6","#4190c5","#408fc4","#3f8ec4","#3e8dc3","#3d8cc3","#3c8bc2","#3b8ac2","#3a89c1","#3988c1","#3787c0","#3686c0","#3585bf","#3484bf","#3383be","#3282bd","#3181bd","#3080bc","#2f7fbc","#2e7ebb","#2d7dbb","#2c7cba","#2b7bb9","#2a7ab9","#2979b8","#2878b8","#2777b7","#2676b6","#2574b6","#2473b5","#2372b4","#2371b4","#2270b3","#216fb3","#206eb2","#1f6db1","#1e6cb0","#1d6bb0","#1c6aaf","#1c69ae","#1b68ae","#1a67ad","#1966ac","#1865ab","#1864aa","#1763aa","#1662a9","#1561a8","#1560a7","#145fa6","#135ea5","#135da4","#125ca4","#115ba3","#115aa2","#1059a1","#1058a0","#0f579f","#0e569e","#0e559d","#0e549c","#0d539a","#0d5299","#0c5198","#0c5097","#0b4f96","#0b4e95","#0b4d93","#0b4c92","#0a4b91","#0a4a90","#0a498e","#0a488d","#09478c","#09468a","#094589","#094487","#094386","#094285","#094183","#084082","#083e80","#083d7f","#083c7d","#083b7c","#083a7a","#083979","#083877","#083776","#083674","#083573","#083471","#083370","#08326e","#08316d","#08306b"];
    
    //del array me cojo los colores que me interesan en función del número de escalas que tenga mi leyenda
    var myLegendColors = function (a,b){
        let c=["white"];
        let d=Math.floor(b);
        for (let i=0;i<a.length;i+=d){
            c.push(a[i]);
        }
        return c;
    };
    
    var scaleColor = d3.scaleOrdinal(myLegendColors(myColors,priceScale)); //esta es una escala, podemos usar la que queramos (d3.schemeTableau10)

    createdPath.attr('fill', function (d){
        console.log(d);
        var arrayLegendColors = myLegendColors(myColors,priceScale);
        let a = minX;
        
        if(d.properties.avgprice!=undefined){
            for (let z=1;z<arrayLegendColors.length;z++){
                if(d.properties.avgprice>(a+priceScale)){
                    a+=priceScale;
                } else {
                    return arrayLegendColors[z];
                }
            }
        } else {
            return "white";
        }
    });
    
    //Creacion de una leyenda
    
    var widthRect = (width / nblegendTotal) - 2;
    var heightRect = 11;

    var scaleLegend = d3.scaleLinear()
        .domain([0, nblegendTotal])
        .range([0, width]);


    var legend = svg.append("g")
        .selectAll("rect")
        .data(myLegendColors(myColors,priceScale))
        .enter()
        .append("rect")
        .attr("width", widthRect)
        .attr("height", heightRect)
        .attr("x", (d, i) => scaleLegend(i)) // o (i * (widthRect + 2)) //No haria falta scaleLegend
        .attr("fill", (d) => d)
        .attr('opacity', 0.75);

        legend.on('mouseover', HandleMouseOver);
        legend.on('mouseout', HandleMouseOut);

    var text_legend = svg.append("g")
        .selectAll("text")
        .data(myScaledPrices(minX,nblegend,priceScale))
        .enter()
        .append("text")
        .attr("x", (d, i) => scaleLegend(i)) // o (i * (widthRect + 2))
        .attr("y", heightRect * 2.5)
        .text((d) => d)
        .attr("font-size", 12)

    var tooltip = d3 //nuestra nueva leyenda
        .select("div")
        .append("div")
        .attr("class", "tooltip");


    function HandleMouseOver (event,d,i){
        d3.select(this)
            .attr('opacity', 1)
            .attr('stroke', 'black');
            
        tooltip //mi nueva leyenda.
            .style("visibility","visible")
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 30) + "px")
            .text(`Precio: ${d.properties.avgprice} euros; Barrio: ${d.properties.name}`);
    }

    function HandleMouseOut (event,d){
        d3.select(this)
            .attr('opacity', 0.75)
            .attr('stroke', '#e9f2fa');
        
        tooltip
            .style("visibility","hidden")
    }
}