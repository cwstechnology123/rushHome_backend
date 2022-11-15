// Call the dataTables jQuery plugin
$(document).ready(function() {

	const table = $('#example2').DataTable({
        "bJQueryUI": false,
        "pagingType": "full_numbers",
        "iDisplayLength": 10,
        "bAutoWidth": false,
        "aaSorting": [ ], // Prevents initial sorting 
        "scrollX": true
    });

	const usertable = $('#userDatatable').DataTable({
	        "paging": true,
	        "pagingType": "full_numbers",
	        "pageLength": 10,
	        "processing": true,
	        "serverSide": true,
	        "aaSorting": [ ], // Prevents initial sorting 
	        'ajax': {
	            'type': 'POST',
	            'url': '/admin/users/ajax_user_list'
	        },
	       "columns": [ 
		        { "data" : "username" },
		        { "data" : "email" },
		        { "data" : "status" },
		        { "data" : "created_at" },
		        { "data" : "action" }
		   ] ,
	        "columnDefs": [
	            {
	                "searchable": false,
	                "orderable": false,
	                "targets": 4
	            },
	            { className: "noWrapTd", "targets": [ 4 ] }
	        ]
	});

});
