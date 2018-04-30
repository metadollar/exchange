/* global $ */

function checker() { // eslint-disable-line
  const name = $('#name')[0].value.replace(/[^A-Za-z0-9_]/gi, '');
  const validNames = ['MetaDollarOzmode_twitter', 'MetaDollarRep1_twitter', 'MetaDollarRep2_twitter', 'MetaDollarRep3_twitter', 'MetaDollarRep4_twitter', 'MetaDollarUX_twitter'];
  if (validNames.map(x => x.toUpperCase()).indexOf(name.toUpperCase()) >= 0) {
    $('#result').html(`${name.toUpperCase()} is an official MetaDollar representative.`);
  } else {
    $('#result').html(`${name.toUpperCase()} is NOT OFFICIAL.`);
  }
}
