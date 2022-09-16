import { module, test } from 'qunit';
import { tracked, cached } from '@glimmer/tracking';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, TestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

type Context = TestContext & {
  personA: any;
  personB: any;
};

module('Integration | Decorators | @cached', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (this: Context, assert) {
    class Person {
      @tracked firstName: string;
      @tracked lastName: string;

      constructor(firstName: string, lastName: string) {
        this.firstName = firstName;
        this.lastName = lastName;
      }

      @cached
      get fullName() {
        const fullName = `${this.firstName} ${this.lastName}`;
        assert.step(fullName);
        return fullName;
      }
    }

    this.personA = new Person('Jen', 'Weber');
    this.personB = new Person('Mel', 'Sumner');

    await render(hbs`
      <div data-person-a>{{this.personA.fullName}}</div>
      <div data-person-B>{{this.personB.fullName}}</div>
    `);

    assert.dom('[data-person-a]').hasText('Jen Weber');
    assert.dom('[data-person-b]').hasText('Mel Sumner');

    this.personA.firstName = 'Bob';
    await settled();

    assert.dom('[data-person-a]').hasText('Bob Weber');
    assert.dom('[data-person-b]').hasText('Mel Sumner');

    assert.verifySteps(['Jen Weber', 'Mel Sumner', 'Bob Weber']);
  });
});
