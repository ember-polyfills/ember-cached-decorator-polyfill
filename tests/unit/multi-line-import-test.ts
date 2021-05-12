import { module, test } from 'qunit';
// prettier-ignore
import {
  cached,
  tracked
 } from "@glimmer/tracking";

module('Unit | Import | multi-line import', function () {
  test('it works', function (assert) {
    class Person {
      @tracked firstName = 'Jen';
      lastName = 'Weber';

      @cached
      get fullName() {
        const fullName = `${this.firstName} ${this.lastName}`;
        assert.step(fullName);
        return fullName;
      }
    }

    const person = new Person();
    assert.verifySteps([], 'getter is not called after class initialization');

    assert.strictEqual(person.fullName, 'Jen Weber');
    assert.verifySteps(
      ['Jen Weber'],
      'getter was called after property access'
    );

    assert.strictEqual(person.fullName, 'Jen Weber');
    assert.verifySteps(
      [],
      'getter was not called again after repeated property access'
    );
  });
});
