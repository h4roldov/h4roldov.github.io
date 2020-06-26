var terminal_history = [];
var terminal_display = [];
var boot = true;
var muted = false;

//var boot_sound = new Audio("sounds/boot_real.mp3");
var noise_sound = new Audio("sounds/noise_real.ogg");
var type_sound = new Audio("sounds/type2.mp3");
var type_sound2 = new Audio("sounds/type2.mp3");

var sound = new Howl({
  src: ["sounds/noise_real.ogg"],
  autoplay: false,
  loop: true
});

var boot_sound = new Howl({
  src: ["sounds/boot.mp3"],
  autoplay: false
});

var uno = true;
var pressed = false;

var command_list = [
  "?",
  "help",
  "bio",
  //"projects",
  "contact",
  "clear",
  "exit",
  "ls",
  //"cd",
  //"for",
  "get",
  "about",
  "for",
  "flowers",
  //"valentines",
  "mute"
];

var help_description = [
 // ["? - Prints the introduction message."],
 // ["help - Lists the available commands with their description."],
  ["bio - Prints a short biography."],
  ["contact - Lets the user send a message to the webmaster."],
  ["clear - Clears the screen."],
  ["ls - Lists all downloadable files."],
  ["get - Fetches the indicated file."],
  ["about - Gives general information about this site."]
];

help_description.sort(function(a, b) {
  return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
});

command_list.sort();

var file_list = ["cv.pdf", "", "", ""];
file_list.sort();

Array.prototype.contains = function(str) {
  return this.indexOf(str) > -1;
};

/*First message*/
var init_message = [
  /* "H4ROLDOV INDUSTRIES (TM)",
  "ASYNCHRONICAL MEASUREMENTS YIELDED (AMY)",
  "------------------------------------------------",
  "AMY V 2.0.0",
  "(C) 2019 H4ROLDOV INDUSTRIES",
  "-CHILE-",
  "",*/
  "Type «help» for more information."
];

/*Used for command line prompt*/
var prompt_prefix = "";
var command_buffer = "";
var character_limit = 40;

/*Used for caret*/
var has_caret = false;

/*Used for autocomplete*/
var second_tab = false;

/*Used for command history*/
var history_index = 0;
/*var in_limit = false;*/

/*Used to track applications*/
var is_executing = false;
var execution_callback = undefined;

/*Used to track contact states*/
var contact_state = 0;

/*Used to track flower app states*/
var flowers_state = 0;

/*Check if mobile with res
function is_mobile() {
   if(window.innerWidth <= 800 && window.innerHeight <= 600) {
     return true;
   } else {
     return false;
   }
}*/

function is_mobile() {
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4)
    )
  )
    return true;
  return false;
}

function insert_mobile_prompt() {
  var mobile_prompt = document.createElement("DIV");
  mobile_prompt.setAttribute("id", "prompt");
  $("#prompt").replaceWith(mobile_prompt);

  var prompt = document.createElement("DIV");
  prompt.setAttribute("id", "prompt_prefix");
  mobile_prompt.appendChild(prompt);

  var input = document.createElement("input");
  input.type = "text";
  input.setAttribute("id", "prompt_buffer");
  input.setAttribute("value", "die");
  mobile_prompt.appendChild(input);
  show_prompt("");
}

function reset() {
  prompt_prefix = "bash $ ";
  command_buffer = "";
  contact_state = 0;
  flowers_state = 0;
  character_limit = 40;
}

function reset_interaction() {
  reset();
  is_executing = false;
  execution_callback = undefined;
}

function show_prompt(buffer) {
  playSound();
  if (is_mobile()) {
    document.getElementById("prompt_prefix").innerHTML = prompt_prefix;
    $("#prompt_buffer").val(buffer);
  } else {
    var command_line = prompt_prefix + buffer;
    document.getElementById("prompt").innerHTML = command_line;
  }
}

function insert_new_prompt(new_prompt) {
  var new_display = document.createElement("DIV");
  new_display.setAttribute("class", "display");
  var text_lines = prompt_prefix + command_buffer;
  text_lines = text_lines.split("<br>");
  if (text_lines.length === 1) {
    new_display.appendChild(
      document.createTextNode(prompt_prefix + command_buffer)
    );
  } else {
    for (i = 0; i < text_lines.length; i++) {
      new_display.appendChild(document.createTextNode(text_lines[i]));
      var linebreak = document.createElement("br");
      new_display.appendChild(linebreak);
    }
  }

  var prompt = document.getElementById("prompt");
  var terminal = document.getElementById("main_terminal");
  terminal.insertBefore(new_display, prompt);

  prompt_prefix = new_prompt;
  command_buffer = "";
  show_prompt("");
}

function show_caret() {
  if (has_caret) {
    show_prompt(command_buffer + "|");
    //"|"
    has_caret = false;
  } else {
    show_prompt(command_buffer);
    has_caret = true;
  }
}

function create_display(text, first_message) {
  $("#lastInserted").removeAttr("id");
  var new_display = document.createElement("DIV");
  new_display.setAttribute("class", "display");
  new_display.setAttribute("id", "lastInserted");
  if (typeof text === "string") {
    new_display.appendChild(document.createTextNode(text));
  } else {
    for (i = 0; i < text.length; i++) {
      new_display.appendChild(document.createTextNode(text[i]));
      var linebreak = document.createElement("br");
      new_display.appendChild(linebreak);
    }
  }

  var prompt = document.getElementById("prompt");
  var terminal = document.getElementById("main_terminal");
  terminal.insertBefore(new_display, prompt);

  if (typeof first_message === "undefined") first_message = false;
  if (!first_message) {
    var old_prompt = document.createElement("DIV");
    old_prompt.setAttribute("class", "display");
    if (command_buffer !== "") {
      old_prompt.appendChild(
        document.createTextNode(prompt_prefix + command_buffer)
      );
    } else {
      var old_command_buffer = terminal_history[terminal_history.length - 1];
      if (typeof old_command_buffer === "undefined") old_command_buffer = "";
      old_prompt.appendChild(
        document.createTextNode(prompt_prefix + old_command_buffer)
      );
    }
    terminal.insertBefore(old_prompt, new_display);
  }
  return new_display;
}

function startsWith(string, prefix) {
  return string.slice(0, prefix.length) == prefix;
}

function autocomplete_command(command) {
  var possibilities = [];
  for (i = 0; i < command_list.length; i++) {
    if (startsWith(command_list[i], command) || command === "") {
      possibilities.push(command_list[i]);
    }
  }
  if (possibilities.length == 1) command_buffer = possibilities[0];
  else create_display(possibilities);
}

function autocomplete_file(filename) {
  var possibilities = [];
  for (i = 0; i < file_list.length; i++) {
    if (startsWith(file_list[i], filename) || filename === "") {
      possibilities.push(file_list[i]);
    }
  }

  if (possibilities.length == 1) {
    var split_buffer = command_buffer.split(" ");
    var last_elem = split_buffer.length - 1;
    split_buffer[last_elem] = possibilities[0];
    command_buffer = split_buffer.join(" ");
  } else create_display(possibilities);
}

function clear_scr() {
  var terminal = document.getElementById("main_terminal");
  $(".display").remove();
  $("#flowers-overlay").remove();
}

function bio() {
  create_display(["", "My name is Haroldo Vivallo I am a Computer Science Engineer currently working as a Full-Stack in Santiago, Chile, developing management and data visualization systems focused on digital transformation.", "I am very interested in Artificial Intelligence, Machine learning and Big Data, and that's why I'm doing a Master in Artificial Intelligence.", ""]);
}

function ls() {
  create_display(file_list);
}

function get(args) {
  // request = $.ajax({
  //   url: "php/downloads.php",
  //   type: "POST",
  //   data: { f: args[1] },
  //   success: function(result) {
  //     result = JSON.parse(result);
  //     console.log(result);
  //     if (result["found"]) {
  //       window.location = result["address"];
  //     } else {
  //       create_display("File not found!");
  //     }
  //   }
  // });
  var link = document.createElement("a");
  link.download = 'cv';
  link.href = '../cv.pdf';
  link.click();
}

function forwhom(args) {
  request = $.ajax({
    url: "php/for.php",
    type: "POST",
    data: { whom: args[1] },
    success: function(result) {
      console.log(result);
      result = JSON.parse(result);
      if (result["found"]) {
        create_display("");
        $("#lastInserted").html(result["embed"]);
      } else {
        create_display("for: nothing found");
      }
      window.scrollTo(0, document.body.scrollHeight);
    }
  });
}

function help() {
  var displayed_text = [""];

  for (var i = 0; i < help_description.length; i++) {
    displayed_text.push(help_description[i][0]);
    // displayed_text.push("        " + help_description[i][1]);
    //displayed_text.push("");
  }
  displayed_text.push("");
  //displayed_text.pop();
  create_display(displayed_text);
}

function about() {
  create_display([
    //"",
    "","This is my personal site","Based on terminal.js by Arturo CURIEL and Fallout Terminal Inspired Style by Mack Richardson.",""
  ]);
}

function execute(command) {
  if (command === "") {
    create_display("");
  } else if (!command_list.contains(command.split(" ")[0])) {
    create_display(command.split(" ")[0] + ": command not found");
  } else {
    var command_with_args = command.split(" ");
    if (command_with_args.length > 1) {
      if (command_with_args[0] === "get") {
        get(command_with_args);
      } else if (command_with_args[0] === "for") {
        forwhom(command_with_args);
      }
    } else if (command === "clear") {
      clear_scr();
    } else if (command === "about") {
      about();
    } else if (command === "?") {
      create_display(init_message);
    } else if (command === "bio") {
      bio();
    } else if (command === "ls") {
      ls();
    } else if (command === "mute") {
      alternateSound();
      if (muted) create_display("Sound muted, type mute to activate");
      else create_display("Sound activated, type mute to mute");
    } else if (command === "help") {
      help();
    } else if (command === "exit") {
      // window.alert("This is not a real terminal XD XD XD.");
      //        }else if(command === "valentines"){
      //            window.location = "./valentines";
    } else if (command === "contact") {
      is_executing = true;
      execution_callback = contact_form_interaction;
      next_contact_state();
    } else if (command === "flowers") {
      is_executing = true;
      execution_callback = flowers_interaction;
      next_flowers_state();
    } else {
      create_display("");
    }
  }
}

function normal_interaction(key) {
  if (key === 9) {
    /*TAB*/
    if (!second_tab) {
      second_tab = true;
    } else {
      second_tab = false;
      if (command_buffer.split(" ").length == 1)
        autocomplete_command(command_buffer);
      else {
        var split_buffer = command_buffer.split(" ");
        var last_elem = split_buffer.length - 1;
        autocomplete_file(split_buffer[last_elem]);
      }
      window.scrollTo(0, document.body.scrollIntoView);
    }
  } else {
    if (second_tab) second_tab = false;
    if (key === 8) {
      /*BACKSPACE*/
      command_buffer = command_buffer.slice(0, -1);
      if (is_mobile()) show_prompt(command_buffer);
      else show_prompt(command_buffer + "|");
      //"|"
    } else if (key === 13) {
      /*ENTER*/
      if (is_mobile()) {
        command_buffer = $("#prompt_buffer").val();
      }
      var command = command_buffer;
      command_buffer = "";
      show_prompt("");
      terminal_history.push(command);
      execute(command);
      history_index = 0;
      window.scrollTo(0, document.body.scrollIntoView);
    } else if (key === 37) {
      /*LEFT*/
    } else if (key === 38) {
      /*RIGHT*/
      if (history_index === 0) {
        if (terminal_history.length > 0) {
          history_index = terminal_history.length - 1;
          command_buffer = terminal_history[history_index];
        }
      } else {
        history_index = history_index - 1;
        command_buffer = terminal_history[history_index];
      }
    } else if (key === 39) {
      /*UP*/
    } else if (key === 40) {
      /*DOWN*/
      if (history_index + 1 <= terminal_history.length - 1) {
        history_index = history_index + 1;
        command_buffer = terminal_history[history_index];
      } else if (history_index === terminal_history.length - 1) {
        command_buffer = "";
        history_index = 0;
      }
    } else {
      //document.getElementById("prompt").innerHTML += key;
    }
  }
}

/*******************CONTACT**********************/

var mail_form = undefined;

function add_field_to_mail_form(name, value) {
  var i = document.createElement("input"); //input element, text
  i.setAttribute("type", "hidden");
  i.setAttribute("name", name);
  i.setAttribute("value", value);
  mail_form.appendChild(i);
}

function next_contact_state() {
  if (contact_state === 0) {
    mail_form = document.createElement("form");
    mail_form.setAttribute("id", "mail_form");
    create_display([
      "",
      "Send an email to Haroldo! (Press CTRL-C to cancel)",
      ""
    ]);
    prompt_prefix = "Type your name: ";
    show_prompt("");
    contact_state = 1;
  } else if (contact_state === 1) {
    add_field_to_mail_form("name", command_buffer);
    insert_new_prompt("Type your email address: ");
    contact_state = 2;
  } else if (contact_state === 2) {
    add_field_to_mail_form("email", command_buffer);
    insert_new_prompt("Subject of your message: ");
    contact_state = 3;
  } else if (contact_state === 3) {
    add_field_to_mail_form("subject", command_buffer);
    insert_new_prompt(
      "<br>Type your message (press CTRL-M when you are finished to send it):<br>"
    );
    character_limit = 500;
    contact_state = 4;
  } else if (contact_state === 4) {
    add_field_to_mail_form("message", command_buffer.replace("<br>", "\n"));
    document.getElementsByTagName("body")[0].appendChild(mail_form);
    request = $.ajax({
      url: "php/mailer.php",
      type: "POST",
      data: $("#mail_form").serialize(),
      success: function(result) {
        console.log(result);
        result = JSON.parse(result);
        console.log(result);
        if (result["sent"]) {
          create_display(["", "Your message was successfully sent!"], true);
        } else {
          create_display(
            ["", "Couldn't send your message!"].concat(
              result["error"].split("<br>")
            ),
            // .concat("\n"),
            true
          );
        }
        window.scrollTo(0, document.body.scrollHeight);
      },
      error: function() {
        create_display(
          ["", "Couldn't send your message! (service disabled)"],
          true
        );
      }
    });
    mail_form = undefined;
    $("#mail_form").remove();
    insert_new_prompt("");
    reset_interaction();
  }
}

function contact_form_interaction(key) {
  if (key === 8) {
    /*BACKSPACE*/
    command_buffer = command_buffer.slice(0, -1);
    if (command_buffer.endsWith("<br"))
      // When writing message, remove spaces
      command_buffer = command_buffer.slice(0, -3);
    if (is_mobile()) {
      show_prompt(command_buffer);
    } else {
      show_prompt(command_buffer + "|");
      //"|"
    }
  } else if (key === 13) {
    /*ENTER*/

    if (contact_state !== 4) next_contact_state();
    else {
      command_buffer += "<br>"; // When writing message, insert spaces
    }
    window.scrollTo(0, document.body.scrollHeight);
  } else if (key === 27) {
    /*ESCAPE*/
    if (contact_state === 4) next_contact_state();
  }
}

/********************Flowers****************************/

var secrets = [
  "3174efdaff7d059b46c35cdd556908c72d2317293c479751f4995844a5ccc93d",
  "095022a351a707f695fb48f80ef2a414998db2ff105f143b77ff26a6414ab8ab",
  "69db31976ead37b85cc42a49c95fd06eec99cfd9b7ff219a25c0f59cb4049343",
  "32428b4cc06e63d5c25e26f9fcdc48db7a2d29797922638e02e92b3c2c872718",
  "0048a973df331dcc6fa69755734c1956f94f9183922e577dcfb808f7a7d496a9"
];

function is_secret(some_word) {
  var pos_secret = hex_sha256(some_word).toString();
  for (var i = 0; i < secrets.length; i++)
    if (pos_secret === secrets[i]) return true;
  return false;
}

function next_flowers_state() {
  if (flowers_state === 0) {
    create_display(["", "Get flowers (Press CTRL-C to cancel)", ""]);
    prompt_prefix = "Type a word: ";
    show_prompt("");
    flowers_state = 1;
  } else if (flowers_state === 1) {
    var w = $("#content").width();
    var flower_center = { x: Math.round(w / 2), y: 150 };
    var analysis = analyze_word(command_buffer);
    if (analysis.length > 1) {
      create_display("");
      raphael_canvas = new Raphael(
        document.getElementById("lastInserted"),
        w,
        300
      );
      flower = create_flower(analysis, raphael_canvas, flower_center, 16);

      // Hacky erasal of previous info
      prompt_prefix = "";
      command_buffer = "";

      if (is_secret(analysis.word)) {
        // Inserts blank space for compliance with forwhom
        terminal_history.push("");
        forwhom(["for", analysis.word + "Flowers"]);

        // Avoid text input
        character_limit = 0;
        flowers_state = 2;
      } else {
        //Prompt for new word
        insert_new_prompt("Type another word (CTRL-C to cancel): ");
      }
    } else {
      insert_new_prompt("Type a longer word (CTRL-C to cancel): ");
    }
  } else if (flowers_state === 2) {
    // Removes blank space inserted for compliance with forwhom
    terminal_history.pop();
    var w = $(window).width() - 20;
    var h = $(window).height() - 20;

    var overlay = document.createElement("DIV");
    overlay.setAttribute("id", "flowers-overlay");
    overlay.setAttribute("width", w);
    overlay.setAttribute("height", h);

    var content = document.getElementById("content");
    content.appendChild(overlay);

    var canvas = new Raphael(overlay, w, h);
    first_flower = random_flower(canvas);
    second_flower = random_flower(canvas);
    third_flower = random_flower(canvas);
    first_flower.rain(150, 500);
    second_flower.rain(100, 1000);
    third_flower.rain(50, 2000);
    insert_new_prompt("");
    reset_interaction();
  }
}

function flowers_interaction(key) {
  if (key === 8) {
    /*BACKSPACE*/
    command_buffer = command_buffer.slice(0, -1);
    if (command_buffer.endsWith("<br"))
      // When writing message, remove spaces
      command_buffer = command_buffer.slice(0, -3);
    if (is_mobile()) {
      show_prompt(command_buffer);
    } else {
      show_prompt(command_buffer + "|");
      //"|"
    }
  } else if (key === 13) {
    /*ENTER*/
    next_flowers_state();
    window.scrollTo(0, document.body.scrollHeight);
  } else if (key === 27) {
    /*ESCAPE*/
    if (flowers_state === 1) next_flowers_state();
  }
}

/********************SOUNDS*****************************/

function playSound() {
  if (boot) {
    boot = false;
    // Clear listener after first call.
    // boot_sound.once("load", function() {
    //   boot_sound.play();
    //   boot_sound.volume(0.15);
    // });
    boot_sound.play();
    boot_sound.volume(0.35);
    boot_sound.on('play', function(){
      var fadeouttime = 5000;
      setTimeout(
        function(){
          boot_sound.fade(0.35, 0, fadeouttime);
        },
        (boot_sound.duration()/3 - boot_sound.seek())*1000 - fadeouttime
      );
    });
    // boot_sound.play();
    // boot_sound.volume(0.15);
    // Fires when the sound finishes playing.
    // boot_sound.on("end", function() {
    //   sound.play();
    //   sound.volume(0.10);
    // });
  } else {
  }
}

function alternateSound() {
  var vol_img = document.getElementById("volume");
  if (!muted) {
    vol_img.classList.add("fa-volume-mute");
    vol_img.classList.remove("fa-volume-up");
    boot_sound.stop();
    sound.stop();
    muted = true;
  } else if (muted) {
    vol_img.classList.add("fa-volume-up");
    vol_img.classList.remove("fa-volume-mute");
    sound.play();
    muted = false;
  }
}
/*  try {
    if (boot) {
      boot_sound.play();
      boot = false;
    } else {
      noise_sound.play();
    }
  } catch (err) {
    console.log(err);
  }
}*/

function typing() {
  if (uno) {
    type_sound.play();
    uno = false;
  } else {
    type_sound2.play();
    uno = true;
  }
}

/********************JQUERY*****************************/

$(function() {
  $(document).ready(function(e) {
    reset();
    var display = create_display(init_message, true);
    if (is_mobile()) {
      insert_mobile_prompt();
    } else {
      window.setInterval(show_caret, 200);
    }
  });

  $(window).keydown(function(e) {
    if (!pressed) {
      typing();
      pressed = true;
    }
    $(window).keyup(function(e) {
      pressed = false;
    });
    var key = e.which;
    if (
      key === 9 ||
      key === 8 ||
      key === 13 ||
      key === 37 ||
      key === 38 ||
      key === 39 ||
      key === 40
    )
      e.preventDefault();

    if (e.ctrlKey && key === 67) {
      // CTRL-C
      if (is_executing) {
        reset_interaction();
      }
      create_display("", true);
    }

    if (e.ctrlKey && key === 77) {
      // CTRL-M
      if (contact_state === 4) {
        key = 27; //Set to escape for contact interaction
      }
    }

    if (!is_executing) {
      normal_interaction(key);
    } else {
      if (typeof execution_callback !== "undefined") execution_callback(key);
    }
    window.scrollTo(0, document.body.scrollHeight);
  });

  $(window).keypress(function(e) {
    if (command_buffer.length < character_limit)
      command_buffer += String.fromCharCode(e.which);
    if (is_mobile()) show_prompt(command_buffer);
    else show_prompt(command_buffer + "|");
  });
});
