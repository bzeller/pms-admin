var users = {};
var currentUser = null;
var $currentEditRow = null;

function loadUsers (){
  $.getJSON('users.pl?action=getUsers', function(data) {
    for(var i = 0; i < data.length; i++){
      users[data[i].id] = data[i]; 
      addUserToTable(data[i]);
    }
  }).fail(function(jqXHR, textStatus, errorThrown){ 
    alert("Konnte nicht geladen werden: "+textStatus); 
  });
}

function addUserToTable (lUser){
      var $dropdownMenu = $('<div class="btn-group">');
      
      var $editButton = $('<a class="btn btn-primary" href="#"><i class="icon-pencil icon-white"></i> Bearbeiten</a>');
      $editButton.click(on_EditUserClicked);
      
      $dropdownMenu.append($editButton);
      $dropdownMenu.append($('<a class="btn btn-primary dropdown-toggle" data-toggle="dropdown" href="#"><span class="caret"></span></a>'));
      
      
      var $deleteButton = $('<a href="#"><i class="icon-trash"></i> L&ouml;schen</a>');
      $deleteButton.click(on_DeleteUserClicked);
      var $changePasswordButton= $('<a href="#"><i class="icon-asterisk"></i> Passwort &auml;ndern </a>');
      $changePasswordButton.click(on_ChangePasswordClicked);
      
      var $menuList = $('<ul class="dropdown-menu">');
      $menuList.append($changePasswordButton);
      $menuList.append($deleteButton);
      
      $dropdownMenu.append($menuList);
      
      var $dropdownCol = $('<td/>');
      $dropdownCol.append($dropdownMenu);

      var $tableRow = $('<tr/>');
      $tableRow.attr('data-userid',lUser.id);
      $tableRow.append($('<td/>').html(lUser.id));
      $tableRow.append($('<td/>').html(lUser.firstName));
      $tableRow.append($('<td/>').html(lUser.name));
      $tableRow.append($('<td/>').html(lUser.nickName));      
      $tableRow.append($dropdownCol);
      
      $('#userTableBody').append($tableRow);  
}

function editUser (user){
  currentUser = user;
  $('#inputNickname').val(user.nickName);
  $('#inputFirstname').val(user.firstName);
  $('#inputLastname').val(user.name);
  $('#userEditModal').modal('show');  
}

function on_EditUserClicked( ) {
  //use jquery closest to find table row that knows the id
  $currentEditRow  = $(this).closest('tr');
  var userId = $currentEditRow.attr('data-userid');

  if(userId === undefined)
    return;
  
  if(users[userId] === undefined){
    alert("Unknown UserID");
    return;
  }
  editUser(users[userId]);
}

function on_AddUserClicked( ) {
  $currentEditRow  = null;
  var newUser = {
    id        : -1,
    name      : "",
    firstName : "",
    nickName  : ""
  };
  
  editUser(newUser);
}

function on_DeleteUserClicked(){
  //use jquery closest to find table row that knows the id
  
  if (!confirm("Möchten Sie den User wirklich löschen?\nDiese Aktion kann man nicht rückgängig machen.")) {
                return;
  }
  
  $currentEditRow  = $(this).closest('tr');
  var userId = $currentEditRow.attr('data-userid');
  
  var jsonData = jsonData =JSON.stringify({ id : userId});
  
  $.postJSON('users.pl?action=delUser',jsonData,function(data){
    if(data.result == false){
      alert("User konnte nicht gelöscht werden: "+data.error);
    }else{
      $currentEditRow.slideUp("normal",function(){$currentEditRow.remove(); $currentEditRow = null;});
    }
  }).fail(function(jqXHR, textStatus, errorThrown){ 
    var message = textStatus;
    alert("User konnte nicht gespeichert werden: "+message);
  }); //ajax  
}

function on_CancelEditUserClicked(){
  $('#userEditModal').modal('hide');
}

function on_SaveEditUserClicked(){
  var obj = {};
  obj.id = currentUser.id;
  obj.name = $('#inputLastname').val();
  obj.firstName = $('#inputFirstname').val();
  obj.nickName = $('#inputNickname').val();
  
  var jsonData =JSON.stringify(obj);
  
  $.postJSON('users.pl?action=saveUser',jsonData,function(data){
    if(data.result == false){
      alert("User konnte nicht gespeichert werden: "+data.error);
    }else{
      var isNewUser = (obj.id == -1);
      obj.id = data.id;
      users[obj.id] = obj;
      
      if(isNewUser){
        addUserToTable(obj);
      }else{
        //write data into table
        var $rows = $currentEditRow.children('td');
        $($rows[0]).html(obj.id);
        $($rows[1]).html(obj.firstName);
        $($rows[2]).html(obj.name);
        $($rows[3]).html(obj.nickName);     
      }
      $('#userEditModal').modal('hide');
    }
  }).fail(function(jqXHR, textStatus, errorThrown){ 
    var message = textStatus;
    alert("User konnte nicht gespeichert werden: "+message);
  });
}

function on_ChangePasswordClicked(){
  //use jquery closest to find table row that knows the id
  $currentEditRow  = $(this).closest('tr');
  var userId = $currentEditRow.attr('data-userid');
  currentUser = users[userId];
  $('#passwordEditModal').modal('show');  
}

function on_CancelEditPasswordClicked(){
  $('#passwordEditModal').modal('hide');
}

function on_SaveEditPasswordClicked(){

  var pass  = $('#inputPassword').val();
  var check = $('#inputPasswordCheck').val();
  
  if(pass != check){
    addError($('#passwordEditModal .modal-body'),'Fehler!','Passw&ouml;rter stimmen nicht &uuml;berein');
    return;
  }
  
  var jsonData =JSON.stringify({
      id : currentUser.id,
      password : pass
  });
  
  $.postJSON('users.pl?action=changePass',jsonData,function(data){
    if(data.result == false){
      alert("Passwort konnte nicht gespeichert werden: "+data.error);
    }else{
      $('#passwordEditModal').modal('hide');
    }
  }).fail(function(jqXHR, textStatus, errorThrown){ 
    var message = textStatus;
    alert("Passwort konnte nicht gespeichert werden: "+message);
  });
  return;
}  


function addError ($elem,header,message){
  
  //remove old error
  $elem.find('.alert').remove();
  
  var $box = $('<div class="alert alert-block alert-error fade in" id="passwordModalErrorBlock"/>');
  $box.append($('<a class="close" data-dismiss="alert">x</a>'));
  $box.append($('<h4 class="alert-heading">'+header+'</h4>'));
  $box.append($('<p>'+message+'</p>'));
  
  $box.prependTo($elem);
}

$(document).ready(function(){
  enableBlockUI();
  $('#userEditCancel').click(on_CancelEditUserClicked);
  $('#userEditOk').click(on_SaveEditUserClicked);
  $('#passwordEditCancel').click(on_CancelEditPasswordClicked);
  $('#passwordEditOk').click(on_SaveEditPasswordClicked);
  $('#passwordModalErrorBlock').alert();
  $('#addUserButton').click(on_AddUserClicked);
  loadUsers();
});