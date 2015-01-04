// Card view : handles almost eveything.
// There could have been a Router and URIs handling, but given there is a 
// total of three states to the application event handling seemed enough.

var Card = Backbone.View.extend({
  
  el      : '.card',
  events  : {
    'click .forms .switch'           : 'switch',
    'click .forms .login .submit'    : 'login',
    'click .forms .register .submit' : 'register',
    
    'click .content .logout'         : 'logout'
  },
  
  // Switch between login and register forms
  switch: function () {
    this.$('.forms').toggleClass('alt');
    return false;
  },
  
  // Flip the card between content and forms
  flip: function (force) {
    this.$el.toggleClass('flipped', force);
    return false;
  },
  
  // Login query
  login: function () {
    var login = this.$('.login .email').val();
    var pass = this.$('.login .password').val();
    
    if (!login || !pass) {
      
      this.loginError('Wrong login or password');
      return false;
    }
    
    if (!checkMail(login)) {
      this.loginError('Invalid e-mail address');
      return false;
    }
    
    $.get('/login', {
      login: login,
      password: pass
    }, function (data, status) {
      
      if (status === 'success') {
        this.$('.content').html('<p>Logged in as ' + data.data.login + ' !</p><a href="#" class="logout">Logout</a>');
        this.$('.login .email').val('');
        this.$('.login .password').val('');
        this.flip(true); 
      }
      
    }.bind(this), 'json').fail(function(a) {
      
      var data = JSON.parse(a.responseText);
      this.loginError(data.message);
      
    }.bind(this));
    
    
    return false;
  },
  
  // Logout query
  logout: function () {
    
    $.get('/logout', function () {
      
      this.flip(false);
      this.$('.content').html('');
      
    }.bind(this));
    
    return false;
  },
  
  fieldError: function ($field) {
    $field.addClass('error');
    setTimeout(function () {
      $field.removeClass('error');
    }, 2000);
  },
  
  registerError: function (msg) {
    this.$('.register .error').html(msg);
    this.$('.register .error').css('opacity', 1);

    setTimeout(function () {
      this.$('.register .error').css('opacity', 0);
    }, 2000);
  },
  
  loginError: function (msg) {
    this.$('.login .error').html(msg);
    this.$('.login .error').css('opacity', 1);

    setTimeout(function () {
      this.$('.login .error').css('opacity', 0);
    }, 2000);
  },
  
  register: function () {
    
    var $login = this.$('.forms .register .email');
    var $pass = this.$('.forms .register .password');
    var $passConfirmation = this.$('.register .confirm-password');
    var login = $login.val();
    var pass = $pass.val();
    var passConfirmation = $passConfirmation.val();
    
    var error = false;
    
    if (!checkMail(login)) {
      this.fieldError($login);
      error = true;
    }
    
    if (!pass || !passConfirmation || pass !== passConfirmation) {
      this.fieldError($pass);
      this.fieldError($passConfirmation);
      error = true;
    }
    
    if (error) {
      return false;
    }

    $.post('/register', {
      login: login,
      password: pass
    }, function (data, status) {
      
      if (status === 'success') {
        
        this.switch();
        this.$('.forms .register .email').val('');
        this.$('.forms .register .password').val('');
        this.$('.forms .register .confirm-password').val('');
        
      }
      
    }.bind(this), 'json' ).fail(function (a) {
      
      var data = JSON.parse(a.responseText);
      
      this.registerError(data.message);
      this.fieldError($login);
      
    }.bind(this));
    
    return false;
    
  }
  
});

// Utils
function checkMail(mail) { 
  var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(mail);
} 


// Main
$(function () {
  
  var card = new Card();
  
});