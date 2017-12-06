    var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));

    elems.forEach(function(html) {
      var switchery = new Switchery(html);
    });

     toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": true,
      "progressBar": true,
      "positionClass": "toast-top-right",
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

    var $rows = $('#rpi-table tr');
    $('#search').keyup(function() {
        var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
        
        $rows.show().filter(function() {
            var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
            return !~text.indexOf(val);
        }).hide();
    });

    function updateParameter(campaign_id) {
    	var new_param = $("#param-"+campaign_id).val();
    	$.ajax({
    		type: 'POST',  // http method
    		url: '/update-campaign/'+campaign_id+'/'+new_param,
            success: function (data) {
           		console.log(data);
                if (data == 'success') {
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

    function toggleCampaign(campaign_id) {
    	var status = $("#campaign-"+campaign_id).is(":checked");
    	var rpid = $("#tv_id").text();
    	console.log(rpid);
    	console.log(status);
    	console.log(campaign_id);

    	$.ajax({
    		type: 'POST',  // http method
    		url: '/toggle-campaign/'+rpid+'/'+campaign_id+'/'+status,
            success: function (data) {
           		console.log(data);
                if (data == 'success') {
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