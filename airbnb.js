//python -m http.server en el terminal para arrancar el servidor
//hacemos caso de la propiedad avgbedrooms (properties lo ignoramos)
//mejor crear dos lienzos en contenedores diferentes (div)
//el apto es válido dibujar el mapa con los colores en relación al precio medio y dibujar solo un barrio. Para nota sería relacionar al hacer click en el mapa con la gráfica de avgbedrooms
//features.0.properties.avgbedrooms

d3.json('practica_airbnb.json')
  .then((featureCollection) => {
      drawMap(featureCollection);
    });

function drawMap(featureCollection) {

//1. Datos GeoJSON
    console.log(featureCollection)
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
            d.opacity = 1
            return d.opacity
        });

    createdPath.on('click', function(event, d) {
        d.opacity = d.opacity==1 ? 0.5 : 1;
        d3.select(this).attr('opacity', d.opacity);
        //console.log(d.properties.name);
    })

    //damos color
    var scaleColor = d3.scaleOrdinal(d3.schemeTableau10); //esta es una escala, podemos usar la que queramos
    createdPath.attr('fill', (d) => scaleColor(d.properties.name));
    



    //Creacion de una leyenda
    var nblegend = 10;
    var widthRect = (width / nblegend) - 2;
    var heightRect = 10;

    var scaleLegend = d3.scaleLinear()
        .domain([0, nblegend])
        .range([0, width]);


    var legend = svg.append("g")
        .selectAll("rect")
        .data(d3.schemeTableau10)
        .enter()
        .append("rect")
        .attr("width", widthRect)
        .attr("height", heightRect)
        .attr("x", (d, i) => scaleLegend(i)) // o (i * (widthRect + 2)) //No haria falta scaleLegend
        .attr("fill", (d) => d);

    var text_legend = svg.append("g")
        .selectAll("text")
        .data(d3.schemeTableau10)
        .enter()
        .append("text")
        .attr("x", (d, i) => scaleLegend(i)) // o (i * (widthRect + 2))
        .attr("y", heightRect * 2.5)
        .text((d) => d)
        .attr("font-size", 12)
}

//  Si quisiesemos unir  dos archivos Geojson
// npm install -g topojson (Primero instalar node.js) => solo para uniones
// topojson spain.json canarias.json -o full_spain.json