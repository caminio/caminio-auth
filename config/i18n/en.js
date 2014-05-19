module.exports = function( t ){

  t.authentication_failed = 'Authentication failed!';
  t.currently_logged_in = 'This account is currently logged in! You can kick the currently logged in user by logging in again and klick the "kick" <span class="hide kick-user">Kick</span> button. This will cause the current user to loose the ability to save their data.';
  t.has_been_kicked = 'The account __name__ has been kicked off as requested';
  t.insufficent_rights = 'Insufficent privileges!';

  t.user_unknown = 'Authentication failed';
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
  t.auth.mailer.subject_pwd_changed = 'Your password has been changed';
  t.auth.mailer.subject_welcome = 'Welcome on caminio!';
  t.auth.link_has_been_sent = 'An email has been sent to __email__. Please check your inbox';
  t.auth.security_transgression = 'Fatal security transgression!';

  t.user = t.user || {};
  t.user.errors = t.user.errors || {};
  t.user.errors.too_short = 'The chosen password is too short. Please use 6 characters at least. Please ensure, you have at least one uppercase, one lowercase character and one digit';
  t.user.errors.requirements_not_met = 'The chosen password does not meet all requirements. Please use at least one uppercase, one lowercase character and one digit, in total at least 6 characters';

  t.setup = t.setup || {};
  t.setup.title = 'Initial setup';
  t.setup.desc = 'This is the first time you launch this application. You should start with creating an administrator account';
  t.setup.name = 'Your organization name';
  t.setup.choose_email = 'Administrator\'s email address';
  t.setup.choose_pwd = 'Administrator\'s password';
  t.setup.domain_name = 'Domain name';
  t.setup.create = 'Create Account';
  t.setup.domain_name_desc = 'Domain name';
  t.setup.fill_in_all_fields = 'Please fill in all fields';
  t.setup.successful = 'Setup successfully completed';
  t.setup.already_initialized = 'Setup has already been ran on this application instance';

  t.user_unknown = 'Invalid email address or password';

  t.username_email = 'Username';
  t.password = 'Password';
  t.login = 'Login';
  t.send_email = 'Send email';
  t.forgotten_password = 'Forgotten password?';
  t.enter_email = 'Email address';
  t.remember_your_email = 'If you remember your Email address, you can request a link to reset your password.';
  t.request_link = 'Request link';
  t.user_unknown = 'Login failed! - User unkown';
  t.toggle_sidebar = 'Toggle sidebar';
  t.logout = 'Logout';

};
