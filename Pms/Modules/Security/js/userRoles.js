var knownRoles = {};

function loadUsers(){
  var $select = $('#selectUser');
  $select.empty();
  $('#roleTableBody').empty();
  
  var $defOpt = $('<option/>');
  $defOpt.attr('value',-1);
  $defOpt.html("-- User w&auml;hlen --");
  $defOpt.appendTo($select);
  
  $.getJSON('module.pl?mod=Security;action=getUsers', function(data) {
    for(var i = 0; i < data.length; i++){
      var $opt = $('<option/>');
      $opt.attr('value',data[i].id);
      $opt.html(data[i].nickName);
      $opt.appendTo($select);
    }
  }).fail(function(jqXHR, textStatus, errorThrown){ 
    alert("Konnte nicht geladen werden: "+textStatus); 
  });
}

function loadRoles (userId){
  knownRoles = {};
  
  var $select = $('#selectRole');
  
  $select.empty();
  var $defOpt = $('<option/>');
  $defOpt.attr('value',-1);
  $defOpt.html("-- Role w&auml;hlen --");
  $defOpt.appendTo($select);
  
  $.getJSON('module.pl?mod=Security;action=getAvailableUserRoles',function(data){
    for(var i = 0; i < data.length; i++){
      var curr = data[i];
      
      knownRoles[curr.id] = curr;
      addRoleToSelect($select,curr.id);
    }
    
    var jsonData = JSON.stringify({
      userRef : userId
    });
    $.postJSON('module.pl?mod=Security;action=getUserRoles',jsonData,function(data){
      for(var i = 0; i < data.length; i++){
        moveRoleToTable(data[i].roleRef);
      }
    }).fail(function(jqXHR, textStatus, errorThrown){ 
      alert("Konnte nicht geladen werden: "+textStatus); 
    });
  }).fail(function(jqXHR, textStatus, errorThrown){ 
    alert("Konnte nicht geladen werden: "+textStatus); 
  });  
}

function addRoleToSelect ($select,roleId){
  var $opt = $('<option/>');
  $opt.attr('value',knownRoles[roleId].id);
  $opt.html(knownRoles[roleId].description);
  $opt.appendTo($select);
}

function on_RemoveRoleClicked(){
  var $currentEditRow  = $(this).closest('tr');
  var roleId = $currentEditRow.attr('data-roleid');
  var userId = $('#selectUser').val();
  
  var jsonData = JSON.stringify({
      userRef : userId,
      roleRef : roleId
  });
  
  $.postJSON('module.pl?mod=Security;action=removeUserRole',jsonData,function(data){
    if(data.result == false){
      alert("Role konnte nicht entfernt werden "+data.error);
    }else{
      removeRoleFromTable(roleId);
    }
  }).fail(function(jqXHR, textStatus, errorThrown){ 
    var message = textStatus;
    alert("Role konnte nicht entfernt werden: "+message);
  });
  
}

function moveRoleToTable (roleId){
  if(roleId < 0)
    return;
  
  var $optionElement = $('#selectRole option[value="'+roleId+'"]');
  if($optionElement){
      $('#selectRole').val(-1);
      $optionElement.remove();
      
      var $removeButton = $('<a class="btn btn-primary" href="#"><i class="icon-pencil icon-white"></i> Entfernen</a>');
      $removeButton.click(on_RemoveRoleClicked);
      
      var $tableRow = $('<tr/>').attr("id","rowRole"+roleId);
      $tableRow.attr('data-roleid',roleId);
      $tableRow.append($('<td/>').html(knownRoles[roleId].name));
      $tableRow.append($('<td/>').html(knownRoles[roleId].description));
      $tableRow.append($('<td/>').append($removeButton));
      
      $('#roleTableBody').append($tableRow);     
  }
}

function removeRoleFromTable (roleId){
  $('#rowRole'+roleId).remove();
  addRoleToSelect($('#selectRole'),roleId);
}

$(document).ready(function(){
  enableBlockUI();
  
  $('#selectUser').change(function() {
    $('#roleTableBody').empty();
    loadRoles($(this).val());
  });
  
  $('#addRoleButton').click(function(){
    var userId = $('#selectUser').val();
    var roleId = $('#selectRole').val()
    
    var jsonData = JSON.stringify({
        userRef : userId,
        roleRef : roleId
    });
    
    $.postJSON('module.pl?mod=Security;action=addUserRole',jsonData,function(data){
      if(data.result == false){
        alert("Role konnte nicht hinzugefügt werden "+data.error);
      }else{
        moveRoleToTable(roleId);
      }
    }).fail(function(jqXHR, textStatus, errorThrown){ 
      var message = textStatus;
      alert("Role konnte nicht hinzugefügt werden: "+message);
    });
  });
 
  loadUsers();
});