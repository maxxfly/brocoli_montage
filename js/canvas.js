var marge = 20;
var max_elt = 8;

var mouse_initial_x;
var mouse_initial_y;
var objet_initial_x;
var objet_initial_y;

  /// TODO : creer un effet de cascade lors de l'emplacement

  function magic_detour()
  {
    img = $('#dashboard .with_control IMG:eq(0)');

    c = document.createElement('canvas');
    if(c.getContext)
    {
      c.width = img[0].getAttribute('data-maxwidth');
      c.height = img[0].getAttribute('data-maxheight');

      ctx = c.getContext('2d');
      ctx.drawImage(img[0], 0, 0, c.width, c.height);

      var imgData = ctx.getImageData(0,0, c.width, c.height);

      var delta_pixel = (c.width + 1) * 4;

      var first_pixel = [imgData.data[delta_pixel], imgData.data[delta_pixel + 1], imgData.data[delta_pixel +2]];
      var last_pixel = [ imgData.data[imgData.data.length - 4 - delta_pixel], imgData.data[imgData.data.length - 3 - delta_pixel], imgData.data[imgData.data.length - 2 - delta_pixel]];

      // on calcule l'ecart entre la premiere pixel et la derniere pixel.. voir si y'a un gros decalage, et si ca merite le coup de vouloir detourer ou pas...
      var diff = Math.abs(first_pixel[0] - last_pixel[0]) + Math.abs(first_pixel[1] - last_pixel[1]) + Math.abs(first_pixel[2] - last_pixel[2]);

      if(diff < 50)
      {
        for(i = 0; i < imgData.width * imgData.height * 4; i += 4)
        {
          if(
             imgData.data[i] >= (first_pixel[0] - marge) && imgData.data[i] <= (first_pixel[0] + marge) &&
             imgData.data[i + 1] >= (first_pixel[1] - marge) && imgData.data[i] <= (first_pixel[1] + marge) &&
             imgData.data[i + 2] >= (first_pixel[2] - marge) && imgData.data[i] <= (first_pixel[2] + marge) &&
             imgData.data[i + 3] == "255")
          {
            imgData.data[i+3] = "0";
          }
          else
          {
            /* possibilité de colorisation de l'objet */
          /* imgData.data[i + 2] = imgData.data[i + 2] * 1.4; */
          /*  imgData.data[i + 1] = imgData.data[i + 1] * 1.6;*/
          }
        }
      }
      ctx.putImageData(imgData,0,0);

      img[0].src = c.toDataURL("image/png");
    }
    else
    {
      // bon, on peut pas utiliser le canvas, on le detruit

      delete c;
      window.alert('fonction non supporte par votre navigateur');
      //img[0].src = img[0].src.replace('.jpg', '.png');
    }
    img[0].setAttribute('data-png', 1);
    update_menu();
  }

  function transform_to_canvas(img)
  {
      div = document.createElement('div');
      div.className = "canvas";
      DIV = $(div);

      img_clone = document.createElement('img');
      img_clone.src = img[0].src;

      // on stocke la dimension reelle de l'image dans une propriete
      img_clone.setAttribute('data-maxwidth', img_clone.width);
      img_clone.setAttribute('data-maxheight', img_clone.height);

      // on redimensionne l'image
      img_clone.style.width = Math.min(200, img_clone.width);

      div.setAttribute('data-idproduct', img[0].getAttribute('data-idproduct'));

      $(img_clone).mousedown(function(e)
                             {
                               e.preventDefault();
                               mouse_initial_x = e.pageX;
                               mouse_initial_y = e.pageY;

                               objet_initial_x = $(e.currentTarget.parentNode).position().left;
                               objet_initial_y = $(e.currentTarget.parentNode).position().top;

                               $('.with_control').removeClass('with_control');
                               $(e.currentTarget.parentNode).addClass('with_control');
                               $(e.currentTarget.parentNode).addClass('move');

                               update_menu();

                               /* on attache les differentes events pour le drag'n drop */
                               $("body").bind("mousemove", function(e_move)
                                                            {
                                                              $(e.currentTarget.parentNode).css('left', Math.min(Math.max(objet_initial_x + e_move.pageX - mouse_initial_x, 0), $('#dashboard').width() - $(e.currentTarget.parentNode).width() ) );


                                                              $(e.currentTarget.parentNode).css('top', Math.min(Math.max(objet_initial_y + e_move.pageY - mouse_initial_y, 0), $('#dashboard').height() - $(e.currentTarget.parentNode).height()) );

                                                            });
                               $("body").mouseup(function(e)
                                                 {
                                                    $("body").unbind("mousemove");
                                                    $(".move").removeClass('move');
                                                   });

                             });

     // je rajoute un bouton de fermeture + resize
     div_close = document.createElement('div');
     div_resize = document.createElement('div');
     div_close.className = "close";
     div_resize.className = "resize";

     // gestion du bouton close des element canvas
     $(div_close).click(function(e)
                        {
                          $('#pool_image [data-idproduct='+ e.currentTarget.parentNode.getAttribute('data-idproduct') +']').removeClass('used');
                          $(e.currentTarget.parentNode).remove();
                          update_menu();
                        });

     $(div_resize).mousedown(function(e)
                             {
                               e.preventDefault();

                               mouse_initial_x = e.pageX;
                               objet_initial_x = parseInt($("#dashboard .with_control IMG").css('width'));

                               // on s'occupe du resize de l'objet
                               $("body").bind("mousemove", function(e_move)
                                                            {
                                                                // on resize, mais on definie un minimum (de 30 pixels) mais aussi des maximums pour pas que l'objet puisse sortir lors du resize (calcul par rapport a la droite mais aussi le bas, basés sur le ratio de l'image')
                                                                $("#dashboard .with_control IMG").css('width',
                                                                      Math.min(
                                                                        Math.max(30,
                                                                                 objet_initial_x + e_move.pageX - mouse_initial_x),
                                                                                $('#dashboard').width() -  $("#dashboard .with_control").position().left - $('.canvas .close').width() - 5,
                                                                                ($('#dashboard').height() - $("#dashboard .with_control").position().top) * $("#dashboard .with_control IMG").attr("data-maxwidth") / $("#dashboard .with_control IMG").attr("data-maxheight") - $('.canvas .close').height() - 8
                                                                           ));

                                                            });

                              $("body").mouseup(function(e)
                                                {
                                                  $("body").unbind("mousemove");
                                                });
                            });

     DIV.append(div_close);
     DIV.append(img_clone);
     DIV.append(div_resize);

     $("#pool_image [data-idproduct="+ img[0].getAttribute('data-idproduct') +"]").addClass('used');

     return DIV;
  }

  $(document).ready(function()
    {
    //  jQuery.event.props.push('dataTransfer');
      $('#pool_image IMG').click(function(e)
                                 {
                                    // l'objet est deja present: on le supprime
                                    if(e.target.className == "used")
                                    {
                                      $('#pool_image [data-idproduct='+ e.target.getAttribute('data-idproduct') +']').removeClass("used");
                                      $('#dashboard [data-idproduct='+ e.target.getAttribute('data-idproduct') +']').remove();
                                      update_menu();
                                    }
                                    // l'objet n'est pas present: on le rajoute
                                    else
                                    {
                                      // on verifie si on pas attend la limite du nb d'objets
                                      if( $('#dashboard .canvas').length >= max_elt)
                                      {
                                        window.alert('Attention, limité à '+ max_elt +" objets");
                                      }
                                      else
                                      {
                                        c = transform_to_canvas($(e.target));
                                        c.css('z-index', get_max_zindex() + 1);

                                        $('#dashboard .with_control').removeClass('with_control');
                                        c.addClass('with_control');
                                        a = c.appendTo('#dashboard');

                                        update_menu();
                                      }
                                    }
                                 }
                                );


      $('#pool_image IMG').mousedown(function(e)
                                    {
                                      e.preventDefault();
                                      if(e.currentTarget.className != "used")
                                      {

                                        // on clone l'image
//                                        var clone = e.currentTarget.cloneNode();
                                        var clone = document.createElement('img');
                                        clone.src = e.currentTarget.src;
                                        clone.setAttribute('data-idproduct', e.currentTarget.getAttribute('data-idproduct'));
                                        clone.height = e.currentTarget.height;
                                        clone.width = e.currentTarget.width;
                                        clone.id = "clone_drag";
                                        clone.style.top = e.pageY +"px";
                                        clone.style.left = e.pageX +"px";

                                        $('body').append(clone);

                                        $("body").bind("mousemove", function(e_move)
                                        {
                                          $('#clone_drag').css('top', e_move.pageY);
                                          $('#clone_drag').css('left', e_move.pageX);
                                          $('#clone_drag').css('display', 'block');
                                        });


                                        $("body").mouseup(function(e)
                                                         {
                                                            $("body").unbind("mousemove");

                                                            if(e.pageX >= $('#dashboard').position().left &&
                                                               e.pageX <= $('#dashboard').position().left + $('#dashboard').width() &&
                                                               e.pageY >= $('#dashboard').position().top &&
                                                               e.pageY <= $('#dashboard').position().top + $('#dashboard').height()
                                                            )
                                                            {
                                                              $('#pool_image [data-idproduct='+ $('#clone_drag').attr('data-idproduct') +']:eq(0)').trigger('click');

                                                              var create_elt = $('#dashboard [data-idproduct='+ $('#clone_drag').attr('data-idproduct')  +']');

                                                              create_elt.css('top', Math.max(0, Math.min(e.pageY - $('#dashboard').offset().top - 20,
                                      $('#dashboard').height() - create_elt.height()
                                                              )));
                                                              create_elt.css('left', Math.max(0, Math.min(e.pageX - $('#dashboard').offset().left - 20,  $('#dashboard').width() - create_elt.width()
                                                              )));


                                                            }

                                                            $('#clone_drag').remove();
                                                           });
                                        }
                                    }

      );

      $('#dashboard').click(function(e) {
                              if(e.target == e.currentTarget)
                              {
                                $('.with_control').removeClass('with_control');
                                update_menu();
                              }
                            });

      update_menu();
    }
  );

  function update_menu()
  {
    if($('#dashboard .canvas').length == 0)
    {
      $('#menu BUTTON').attr('disabled', 'disabled');
    }
    else
    {
      $('#menu #btn_delete_all').removeAttr('disabled');

      if($('#dashboard .with_control [data-png=1]').length || $('#dashboard .with_control').length == 0)
      {
        $('#menu #btn_magic_detour').attr('disabled', 'disabled');
      }
      else
      {
        $('#menu #btn_magic_detour').removeAttr('disabled');
      }

      if( $('#dashboard .with_control').css('z-index') == get_max_zindex()  || $('#dashboard .with_control').length == 0)
      {
        $('#menu #btn_max_zindex').attr('disabled', 'disabled');
      }
      else
      {
        $('#menu #btn_max_zindex').removeAttr('disabled');
      }

      if( $('#dashboard .with_control').css('z-index') == get_min_zindex() ||  $('#dashboard .with_control').length == 0)
      {
        $('#menu #btn_lower_zindex').attr('disabled', 'disabled');
      }
      else
      {
        $('#menu #btn_lower_zindex').removeAttr('disabled');
      }


    }
  }

  function get_max_zindex()
  {
    var max_zindex = 0;
    arr = $('#dashboard .canvas');

    for(i=0 ; i < arr.length; i++)
    {
      max_zindex = Math.max(arr[i].style.zIndex, max_zindex);
    }
    return max_zindex;
  }

  function delete_all()
  {
    if(window.confirm('Etes vous sur de vouloir tout supprimer?'))
    {
      $('#dashboard .canvas').remove();
      $('#pool_image .used').removeClass('used');
      update_menu();
    }
  }

  function max_zindex()
  {
    div = $('#dashboard .with_control:eq(0)');
    div.css('z-index', get_max_zindex() + 1);
    update_menu();
  }

  function lower_zindex()
  {
    div = $('#dashboard .with_control:eq(0)');

    zi = get_lower_index(div.css('z-index'));;

    arr = $('#dashboard .canvas');

    for(i=0 ; i < arr.length; i++)
    {
      if(parseInt(arr[i].style.zIndex) >= zi)
      {
        arr[i].style.zIndex = parseInt(arr[i].style.zIndex) + 1;
      }
    }

    div.css('z-index', zi);

    update_menu();
  }

  /* zi = le z-index de l'objet qu'on veut descendre.. on fait diminuer le zindex pour verifier si on trouve pas une image avec un z-index proche mais plus bas) */
  function get_lower_index(zi)
  {
    var max_zindex = 0;
    arr = $('#dashboard .canvas');

    for(i=0 ; i < arr.length; i++)
    {
      if(arr[i].style.zIndex < zi)
      {
        max_zindex = Math.max(arr[i].style.zIndex, max_zindex);
      }
    }
    return max_zindex;
  }

  function get_min_zindex()
  {
    var min_zindex = 1000;
    arr = $('#dashboard .canvas');

    for(i=0 ; i < arr.length; i++)
    {
        min_zindex = Math.min(arr[i].style.zIndex, min_zindex);
    }
    return min_zindex;
  }

  function img_update(url, idproduct, zindex, left, top, width, alpha)
  {
    var img = new Image();
    img.src = url;
    img.setAttribute('data-idproduct', idproduct);

    $(img).load(function()
             {
                c = transform_to_canvas([this]);
                c.css('z-index', zindex);
                c.css('top', top);
                c.css('left', left);

                c.find('img').css('width', width);

                if(alpha)
                {
                  c.find('img').attr('data-png', 1);
                }

                c.appendTo('#dashboard');
             }
     );

  }

  function save()
  {
    o_arr = [];

    elts = $('#dashboard .canvas');

    for(i=0; i < elts.length; i++)
    {
      var elt_arr = {
                  "idproduct": elts[i].getAttribute('data-idproduct'),
                  "z-index": elts[i].style.zIndex,
                  "left": (parseInt(elts[i].style.left ? elts[i].style.left : 0)),
                  "top": (parseInt(elts[i].style.top ? elts[i].style.top : 0)),
                  "width": (parseInt($(elts[i]).children("IMG").css("width"))),
                  "alpha":  $(elts[i]).children("[data-png=1]").length };

      o_arr.push(elt_arr);
    }

      $('#output').val(JSON.stringify({obj: o_arr}));
  }
