module.exports = function( t ){

  t.auth = t.auth || {};
  t.auth.title = 'Login required';
  t.auth.email_address = 'Email address';
  t.auth.password = 'Your password';
  t.auth.confirm_password = 'Re-enter password';
  t.auth.enter_new_password = 'Enter your new password';
  t.auth.confirmation_missmatch = 'Confirmation key missmatch';
  t.back_to_login = 'Back to login';
  t.auth.unknown_email = 'The email address __email__ is not known to this system.';
  t.auth.mailer = t.auth.mailer || {};
  t.auth.mailer.subject_reset_password = 'Reset password request';
  t.auth.link_has_been_sent = 'An email has been sent to __email__. Please check your inbox';
  t.auth.security_transgression = 'Fatal security transgression!';

  t.setup = t.setup || {};
  t.setup.title = 'Initial setup';
  t.setup.desc = 'This is the first time you launch this application. You should start with creating an administrator account';
  t.setup.choose_email = 'Administrator\'s email address';
  t.setup.choose_pwd = 'Administrator\'s password';
  t.setup.domain_name = 'Domain name';
  t.setup.create = 'Create Account';
  t.setup.domain_name_desc = 'e.g.: camin.io';
  t.setup.fill_in_all_fields = 'Please fill in all fields';
  t.setup.successful = 'Setup successfully completed';
  t.setup.already_initialized = 'Setup has already been ran on this application instance';

  t.user_unknown = 'Invalid email address or password';

  t.username_email = 'Username';
  t.password = 'Password';
  t.login = 'Login';
  t.forgotten_password = 'Forgotten password?';
  t.enter_email = 'Email address';
  t.remember_your_email = 'If you remember your Email address, you can request a link to reset your password.';
  t.request_link = 'Request link';
  t.user_unknown = 'Login failed! - User unkown';
  t.authentication_failed = 'Login failed!';
  t.toggle_sidebar = 'Toggle sidebar';
  t.logout = 'Logout';

  t.user = t.user || {};
  t.user.password_saved = 'Your new password has been saved';
  t.user.errors = t.user.errors || {};
  t.user.errors.too_short = 'The entered password is too short (6 characters at least)';
  t.user.errors.requirements_not_met = 'The password must contain at least one digit, at least one lower case character, at least one uppercase character';

};