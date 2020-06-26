/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffle_array(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function get_word(characters, length, distance){
    if(distance<0)
        distance = 0;
    if(length<=0)
        length = 3;
    var word = "";
    for(var i=0;i<length/2;i++){
        random_ix = Math.random()*(characters.length-1);
        random_ix = Math.round(random_ix);
        word += characters[random_ix];
        characters.splice(random_ix, 1);
    }
    random_ix = Math.random()*(characters.length-1);
    random_ix = Math.round(random_ix);
    var additional_char = characters[random_ix];
    characters.splice(random_ix, 1);
    reverse_word = word.split("").reverse().join("");
    if(distance==0){
        if(length % 2 == 0)
            word += reverse_word;
        else
            word += additional_char + reverse_word;
    }else{
        while(word.length < length){
            random_ix = Math.random()*(characters.length-1);
            random_ix = Math.round(random_ix);
            additional_char = characters[random_ix];
            word+=additional_char;
            characters.splice(random_ix, 1);
        }
    }
    return word;
}

// returns a gaussian random function with the given mean and stdev.
function gaussian(avg, std) {
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if(use_last) {
           y1 = y2;
           use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                 x1 = 2.0 * Math.random() - 1.0;
                 x2 = 2.0 * Math.random() - 1.0;
                 w  = x1 * x1 + x2 * x2;               
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
       }

       var retval = avg + std * y1;
       if(retval > 0) 
           return retval;
       return -retval;
   }
}

function get_deformation(coef){
    return (Math.random() * 2 * coef + 1) - coef;
}

function get_average(some_numbers){
    var total = some_numbers.length;
    var sums = 0;
    for(var i=0;i<total;i++){
        sums += some_numbers[i];
    }
    return sums/total;
}

function get_variance(some_numbers){
    var avg = get_average(some_numbers);
    var total = some_numbers.length;
    var sums = 0;
    for(var i=0;i<total;i++){
        sums += Math.pow(some_numbers[i] - avg, 2);
    }
    return sums/total;
}

function get_std(some_numbers){
    var variance = get_variance(some_numbers);
    return Math.sqrt(variance);
}


function fib(position){
    if(position <= 1){
        return 1;
    }else{
        return fib(position-1) + fib(position-2)
    }
}

function deg2rad(degrees){
    return degrees * (Math.PI/180.);
}

function rad2deg(radians){
    return radians * (180./Math.PI)
}

function to_polar(rect_point){
    r = Math.sqrt(Math.pow(rect_point.x, 2) + 
                  Math.pow(rect_point.y, 2));
    tetha = Math.atan(rect_point.y / rect_point.x);
    return {r:r, tetha:tetha};
}

function to_cartesian(polar_point){
    x = polar_point.r * Math.cos(polar_point.tetha);
    y = polar_point.r * Math.sin(polar_point.tetha);
    return {x:x, y:y};
}

/**
 * analyze_word
 * @param {String} some_word
 * @return {object} analysis_results
 */
function analyze_word(some_word){
    some_word = some_word.toLowerCase();
    var word_size = some_word.length;
    if(word_size % 2 == 1)
        var first_limit = Math.floor(word_size / 2) + 1;
    else
        var first_limit = Math.floor(word_size / 2);
        
    var second_limit = Math.floor(word_size / 2);
    var first_half = some_word.substring(0, first_limit);
    var second_half = some_word.substring(second_limit, word_size);
    second_half = second_half.split("").reverse().join("");
    
    var distinct_char_array = {};
    var word_chars = some_word.split("");
    var letter_count = 0;
    for(var i=0; i < some_word.length; i++){
        if(distinct_char_array[word_chars[i]] == undefined){
            letter_count ++;
            distinct_char_array[word_chars[i]] = 0;
        }
        distinct_char_array[word_chars[i]]++;
        word_chars[i] = word_chars[i].charCodeAt(0);
    }
    
    analysis_results = {word : some_word,
                        length : some_word.length,
                        ascii_repr :  word_chars,
                        avg : get_average(word_chars),
                        variance : get_variance(word_chars),
                        std : get_std(word_chars),
                        unique_count : letter_count,
                        sym_distance : Levenshtein.get(first_half, second_half)};
    
    return analysis_results
}

function print_analysis(res){
    console.log("Word: " + res.word);
    console.log("ASCII: " + res.ascii_repr.toString());
    console.log("Avg: " + res.avg.toString());
    console.log("Var: " + res.variance.toString());
    console.log("Std: " + res.std.toString());
    console.log("Distinct Chars: " + res.unique_count);
    console.log("Symmetry (EDist): " + res.sym_distance);
    console.log("");
}

/**
 * create_convex_path
 * 
 * Creates an ellipse around center, deformed by the values in res.
 *
 * @param {object} res (word analysis result)
 * @param {float} inner_radio (size of the center)
 * @param {float} outer_radio (optimal distance for petal edge)
 * @param {object} center (center of canvas)
 * @param {int} rotation (position around circle in deg)
 * @return {object} analysis_results
 */
function create_convex_path(res, 
                            inner_radio, 
                            outer_radio, 
                            ellipse_center,
                            canvas_center, 
                            rotation){
    //x' = a*cos(t)*cos(theta) - b*sin(t)*sin(theta)
    //y' = a*cos(t)*sin(theta) + b*sin(t)*cos(theta)
    if (rotation !== 0){
        rotation = deg2rad(rotation);

        var polar_ellipse_center = to_polar(ellipse_center);
        polar_ellipse_center.tetha += rotation;
        ellipse_center = to_cartesian(polar_ellipse_center);
    }
    ellipse_center.x += canvas_center.x;
    ellipse_center.y += canvas_center.y;
    
    // First deformations
    var def_coefficient = res.sym_distance;
    var width = inner_radio + get_deformation(def_coefficient);
    var height = outer_radio + get_deformation(def_coefficient);
    
    var first = {x:0, y:0};
    
    first.x = (width) * Math.cos(0) * Math.cos(rotation);
    first.x -= (height) * Math.sin(0) * Math.sin(rotation);
        
    first.y = (width) * Math.cos(0) * Math.sin(rotation);
    first.y += (height) * Math.sin(0) * Math.cos(rotation);
        
    first.x += ellipse_center.x;
    first.y += ellipse_center.y;
        
    var path_string = "M" + first.x.toString() + " " + first.y.toString();
    for (var t = 1; t < 2*Math.PI; t+=1){
        
        width = inner_radio + get_deformation(def_coefficient);
        height = outer_radio + get_deformation(def_coefficient);
        
        x_prime = (width) * Math.cos(t) * Math.cos(rotation);
        x_prime -= (height) * Math.sin(t) * Math.sin(rotation);
        
        y_prime = (width) * Math.cos(t) * Math.sin(rotation);
        y_prime += (height) * Math.sin(t) * Math.cos(rotation);
        
        x_prime += ellipse_center.x;
        y_prime += ellipse_center.y;
        
        path_string = path_string + "T" + 
            x_prime.toString() + " " + 
            y_prime.toString();
    }
    path_string = path_string + "Z";
    return path_string;
}

function random_flower(canvas){
    var characters = ["a", "b", "c", "d", "e", "f",
                      "g", "h", "i", "j", "k", "l",
                      "m", "n", "o", "p", "q", "r",
                      "s", "t", "u", "v", "w", "x",
                      "y", "z"];
    var lengths = [3, 4, 5, 6];
    var distances = [0, 1];
    
    var w = canvas.width;
    var h = canvas.height;
    var x = Math.round(Math.random() * w);
    var y = Math.round(Math.random() * h);
    
    var word = get_word(characters, 
                        lengths[Math.round(Math.random()*lengths.length-1)],
                        distances[Math.round(Math.random())]);
    var analysis = analyze_word(word);
    var flower_center = {x:x, y:y};
    return create_flower(analysis, canvas, flower_center, Math.random()*16);
}

/**
 * create_flower
 * 
 * Assumes that a beautiful word is symmetric, uses several characters
 * with respect to its size and covers a wide range of the alphabet 
 * (~high std). Size of the word itself determines size of the flower.
 *
 * @param {String} some_word
 * @return {object} analysis_results
 */
function create_flower(res, canvas, canvas_center, flower_size){
    var flower = {petals:new Array(),
                  center:undefined};
    var phi = 1.618033988749895
    
    // inner_diameter is 0.61 of size
    var inner_diameter = res.length * flower_size * (phi-1);
    
    // outer phi times larger than inner_diameter
    var outer_diameter = inner_diameter + res.length * flower_size;
    
    var inner_radio = Math.round(inner_diameter/2);
    var outer_radio = Math.round(outer_diameter/2);
    
    // Saturation and brightness depend on the Std
    var saturation = res.std/10;
    if (saturation > 1){
        saturation = 1;
    }
    saturation = saturation.toString();
    var brightness = saturation.toString();
    
    // Number of colors depend on unique letters
    var number_of_colors = res.unique_count;
    var hues = new Array();
    var standard = gaussian(Math.random()*360, res.std);
    for(var i=0; i<number_of_colors; i++){
        hues.push(standard());
    }
    
    // Number of petals are in fibonnacci sequence
    var number_of_petals = fib(res.length);
    var rotation_step = 360./number_of_petals;
    var current_rotation = 0;
    var petal_path = "";
    var petal_paths = new Array();
    var def_coefficient = res.sym_distance;
    
    for(var i=0; i < number_of_petals; i++){
        
        // Deform petal size
        var width = inner_radio + get_deformation(def_coefficient);
        var height = outer_radio/2 + get_deformation(def_coefficient);
        var ellipse_center = {x:0, y:-height};
        petal_path = create_convex_path(res, 
                                        width,
                                        height,
                                        ellipse_center,
                                        canvas_center,
                                        current_rotation);
        
        petal_paths.push(petal_path);
        current_rotation += rotation_step;
    }
    
    // Retrieve and paint petals at random
    petal_paths = shuffle_array(petal_paths);
    for(var i=0; i<number_of_petals; i++){
        var petal = canvas.path(petal_paths[i]);
        flower.petals.push(petal);
        
        // Color petal with one of the colors
        var selected_color = Math.round(Math.random()*(number_of_colors-1));
        var petal_color = "hsb(" + hues[selected_color] + "deg," + 
                                   saturation + "," + 
                                   brightness + ")";
        petal.attr({fill:petal_color});
    }
    
    // Paint center of the flower
    var hor_rad = inner_radio + get_deformation(def_coefficient);
    var ver_rad = inner_radio + get_deformation(def_coefficient);
    var inner_circle = canvas.ellipse(canvas_center.x,
                                      canvas_center.y,
                                      hor_rad,
                                      ver_rad)
    
    // Color center with a contrasting color
    selected_color = Math.round(Math.random()*(number_of_colors-1));
    hue = ((hues[selected_color] + 180) % 360).toString();
    
    var inner_color = "hsb(" + hue + "deg," + saturation + "," + saturation + ")";
    inner_circle.attr({fill:inner_color});
    
    flower.center = inner_circle;
    flower.hide = function(){
        for(var i=0; i< this.petals.length; i++){
            this.petals[i].attr({opacity:0});
        }
        this.center.attr({opacity:0});
    }
    flower.show = function(time, callback){
        for(var i=0; i< this.petals.length; i++){
            this.petals[i].animate({opacity:1}, time, "linear");
        }
        this.center.animate({opacity:1}, time/2, "linear",
                            callback);
    }
    flower.rain = function(qty_flowers, time){
        if(qty_flowers>0){
            this.hide();
            this.show(time, function(){
                random_flower(canvas).rain(qty_flowers-1, time);
            });
        }else{
            this.hide();
            this.show(time);
        }
    }
    return flower;
}

/*window.onload = function(){
    var canvas = new Raphael(document.getElementById('canvas_container'), $(window).width(), $(window).height());
    first_flower = random_flower(canvas);
    second_flower = random_flower(canvas);
    third_flower = random_flower(canvas);
    first_flower.rain(150, 500);
    second_flower.rain(100, 1000);
    third_flower.rain(50, 2000);
}*/
