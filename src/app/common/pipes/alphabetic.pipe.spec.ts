import { AlphabeticPipeSpecialty } from './alphabetic.pipe';
import { AlphabeticPipePerson } from './alphabetic.pipe';

describe('AlphabeticPipe', () => {
  it('create an instance', () => {
    const pipe = new AlphabeticPipeSpecialty();
    expect(pipe).toBeTruthy();
  });
});

describe('AlphabeticPipe', () => {
  it('create an instance', () => {
    const pipe = new AlphabeticPipePerson();
    expect(pipe).toBeTruthy();
  });
});
