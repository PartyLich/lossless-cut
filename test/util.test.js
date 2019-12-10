import test from 'tape';
import { basename } from 'path';
import {
  formatDuration,
  parseDuration,
  getOutPath,
} from '../src/util';


test('formatDuration()', (t) => {
  const reUnfriendly = /(\d{2}:){2}(\d{2}\.\d{3})/;
  const reFriendly = /(\d{2}\.){3}(\d{3})/;

  {
    const msg = `fileNameFriendly=false matches unfriendly format (':' delimiter)`;
    const actual = formatDuration(0, false);
    t.ok(reUnfriendly.test(actual), msg);
  }
  {
    const msg = `fileNameFriendly=true matches friendly format ('.' delimiter)`;
    const actual = formatDuration(0, true);
    t.ok(reFriendly.test(actual), msg);
  }
  {
    const msg = 'Zero padding';
    const expected = '01:01:01.001';
    const actual = formatDuration(3661.001, false);
    t.equal(actual, expected, msg);
  }

  t.end();
});

test('parseDuration()', (t) => {
  {
    const msg = 'Returns number';
    const expected = 'number';
    const actual = typeof parseDuration('01:01:01.001');
    t.equal(actual, expected, msg);
  }
  {
    const msg = (place) => `Returns undefined if ${ place } > 59`;
    const expected = undefined;
    t.equal(parseDuration('60:01:01.001'), expected, msg('hours'));
    t.equal(parseDuration('00:60:01.001'), expected, msg('minutes'));
    t.equal(parseDuration('01:01:60.001'), expected, msg('seconds'));
  }
  {
    const msg = `Returns undefined if format is wrong`;
    const expected = undefined;
    t.equal(parseDuration(), expected, msg);
    t.equal(parseDuration(''), expected, msg);
    t.equal(parseDuration('000:60:01.001'), expected, msg);
    t.equal(parseDuration('01:01:060.001'), expected, msg);
  }
  {
    const msg = 'good input';
    const expected = 3661.001;
    const actual = parseDuration('01:01:01.001');
    t.equal(actual, expected, msg);
  }

  t.end();
});

test('getOutPath()', (t) => {
  const filePath = `${ __dirname }/${ __filename }`;
  const suffix = 'test-suffix';

  {
    const msg = 'Appends test suffix';
    const expected = `${ filePath }-${ suffix }`;
    const actual = getOutPath(undefined, filePath, suffix);
    t.equal(actual, expected, msg);
  }
  {
    const msg = 'Uses custom dir if provided';
    const customDir = '/customDir/';
    const filename = basename(__filename);
    const expected = `${ customDir }${ filename }-${ '' }`;
    const actual = getOutPath(customDir, filePath, '');
    t.equal(actual, expected, msg);
  }

  t.end();
});
