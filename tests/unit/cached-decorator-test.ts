import { module, test } from 'qunit';
import { tracked, cached } from '@glimmer/tracking';

module('Unit | Decorators | @cached', function() {
  test('it works', function(assert) {
    class Person {
      @tracked firstName = 'Jen';
      @tracked lastName = 'Weber';

      @cached
      get fullName() {
        const fullName = `${this.firstName} ${this.lastName}`;
        assert.step(fullName);
        return fullName;
      }
    }

    const person = new Person;
    assert.verifySteps([], 'getter is not called after class initialization');

    assert.strictEqual(person.fullName, 'Jen Weber');
    assert.verifySteps(['Jen Weber'], 'getter was called after property access');

    assert.strictEqual(person.fullName, 'Jen Weber');
    assert.verifySteps([], 'getter was not called again after repeated property access');

    person.firstName = 'Kenneth';
    assert.verifySteps([], 'changing a property does not trigger an eager re-computation');

    assert.strictEqual(person.fullName, 'Kenneth Weber');
    assert.verifySteps(['Kenneth Weber'], 'accessing the property triggers a re-computation');

    assert.strictEqual(person.fullName, 'Kenneth Weber');
    assert.verifySteps([], 'getter was not called again after repeated property access');

    person.lastName = 'Larsen';
    assert.verifySteps([], 'changing a property does not trigger an eager re-computation');

    assert.strictEqual(person.fullName, 'Kenneth Larsen');
    assert.verifySteps(['Kenneth Larsen'], 'accessing the property triggers a re-computation');
  });
});
