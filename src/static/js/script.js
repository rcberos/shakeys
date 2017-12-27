    var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
    var varToggleCampaign = true;

    elems.forEach(function(html) {
      var switchery = new Switchery(html);
    });

     toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": true,
      "progressBar": true,
      "positionClass": "toast-bottom-right",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "700",
      "timeOut": "3000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }

    function toggleCampaign(campaign_id) {
      var status = $("#campaign-"+campaign_id).is(":checked");
      var rpid = $("#tv_id").text();
      $("#campaign-"+campaign_id).parent().attr('data-hasData',status);

      $.ajax({
        type: 'POST',  // http method
        url: '/toggle-campaign/'+rpid+'/'+campaign_id+'/'+status,
            success: function (data) {
              console.log(data);
                if (data.success) {
                  toastr.success("Updated");
                }else {
                  toastr.warning("Failed to update. Please try again.");
                }
            },
            error: function (data) {
                    toastr.warning("Failed to update. Please check your internet connection.");
                }
      })
    }


    $("#show-stats").on("click",function(){
      $("#show-stats").hide();
      $("#aircast-preview").hide();
      $("#aircast-preview-first").show(); 
      $("#aircast-preview").html("");
    });

    var $rows = $('#rpi-table tr');
    $('#search').keyup(function() {
        var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
        
        $rows.show().filter(function() {
            var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
            return !~text.indexOf(val);
        }).hide();
    });

    var $rows2 = $('#table-contacts tr');
    $('#search').keyup(function() {
        var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
        
        $rows2.show().filter(function() {
            var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
            return !~text.indexOf(val);
        }).hide();
    });

    $("#toggle-campaign").on("click",function(){

      if (varToggleCampaign) {
        $("#toggle-campaign").html('Show all campaigns');
        $("#show-stats").css("right","210px");
        $("td[data-hasData='false']").parent('tr').hide();
        varToggleCampaign = false;
      }else { 
        $("td[data-hasData='false']").parent('tr').show();
        varToggleCampaign = true;
        $("#toggle-campaign").html('Show only active campaigns');
        $("#show-stats").css("right","260px");
      }
      
    })

    function checkboxAddToNUmberList(item) {


      if ( $('.site-to-send-message li:contains("'+$(item).attr('data-name')+'")').length ) {
         $('.site-to-send-message li:contains("'+$(item).attr('data-name')+'")').remove();
      }else {
        $('.site-to-send-message').append('<li data-num='+$(item).attr('data-number')+'>'+$(item).attr('data-name')+'</li>');  
      }


    }


    function sendMessage() {
      var messg = $("#text-message").val(); 
      var listItems = $(".site-to-send-message li");
      var numList = [];

      if (messg == '') {
       swal(
          'Oops...',
          'Don\'t forget to add your message',
          'info'
        )

      }
      else if (listItems.length == 0) {
        swal(
          'Oops...',
          'You forgot to add the list of numbers to send the message',
          'info'
        )
      }else {
          
          listItems.each(function(idx, li) {
              var numbers_of_sites_to_send = $(li).attr('data-num');
              numList.push('63'+numbers_of_sites_to_send);
          });

          sendMes(numList,messg);


      }

      function sendMes(num_list,mess) {
        $.ajax({ 
            type: "POST",
            url: "http://ec2-54-169-234-246.ap-southeast-1.compute.amazonaws.com/api/v0/message-per-site.php",
            data: {numbers:num_list,message:mess}, 
            dataType: 'json',
            success: function(item){
              console.log(item);
              console.log('done');
            },
            error: function(err) {
              console.log(err);
            }
        });

        swal({
          title: 'Sending Your Messages',
          text: 'this will only take a few seconds',
          timer: 5000,
          onOpen: () => {
            swal.showLoading()
          }
        }).then((result) => {
          if (result.dismiss === 'timer') {
                  $("#text-message").val('');  
                  swal(
                    'Message Sent!',
                    '',
                    'success'
                  )
          }
        })
      }
      

    }

    function updateParameter(campaign_id) {
    	var new_param = $("#param-"+campaign_id).val();
    	$.ajax({
    		type: 'POST',  // http method
    		url: '/update-campaign/'+campaign_id+'/'+new_param,
            success: function (data) {
           		console.log(data);
                if (data.success) {
                	toastr.success("Updated");
                }else {
                	toastr.warning("Failed to update. Please try again.");
                }
            },
            error: function (data) {
                    toastr.warning("Failed to update. Please check your internet connection.");
                }
    	})
    }


    function confirmCampaignDelete(data){
      var campaign_id_to_delete = $(data).attr('id').split("-");
      var status = $("#campaign-"+campaign_id_to_delete[1]).parent().attr('data-hasData');

      if (status == 'true') {
        toastr.warning('Campaign is currently active. Disable it first to delete the campaign.');
      }else {
        $(data).html('<img src="/img/trash-confirm.png" onclick="deleteItem('+campaign_id_to_delete[1]+')">');
        $(data).parent().parent().css('background-color','#dfdfdf');  
      }
      
    }

    function deleteItem(campaign_id) {
      var rpid = $("#tv_id").text();
      
      $.ajax({
        type: 'POST',  // http method
        url: '/delete-campaign/'+rpid+'/'+campaign_id,
            success: function (data) {
              console.log(data);
                if (data.success) {
                  toastr.success('Campaign id: ' + campaign_id+ ' successfully deleted.');
                  $("#deleteCampaign-"+campaign_id).parent().parent().remove();
                }else {
                  toastr.warning("Failed to delete. Please try again.");
                }
            },
            error: function (data) {
                    toastr.warning("Failed to delete. Please check your internet connection.");
                }
      })


      $("#deleteCampaign-"+campaign_id).parent().parent().remove();
      
    }

    function previewCampaign(data) {

      $("#aircast-preview").show();
      $("#show-stats").show();
      $("#aircast-preview-first").hide(); 
      var link = $(data).attr("data-link");
      var type = $(data).attr("data-type");
      console.log(link + type);

      var orientation = $("#orientation-type").text();

      if (orientation == 'landscape') {
        $("#aircast-preview").css("width","410px");

          if (type == 'Image') {
            $("#aircast-preview").html("<img src="+link+" style='width: 400px;' />");  
          }else {
            $("#aircast-preview").html("<video src="+link+" style='width: 400px;' autoplay loop controls />")
          }

      }else {


        if (type == 'Image') {
            $("#aircast-preview").css("width","260px");
            $("#aircast-preview").html("<img src="+link+" style='width: 250px;' />");  
          }else {
            $("#aircast-preview").css("width","410px");
            $("#aircast-preview").html("<video src="+link+" style='width: 400px;' autoplay loop controls />")
          }

      }


      
    }