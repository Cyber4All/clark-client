import { RegistrationProgressComponent } from './registration-progress.component';

describe('RegistrationProgressComponent', () => {
  let component: RegistrationProgressComponent;

  beforeEach(() => {
    component = new RegistrationProgressComponent();
  });

  it('should mark account active in the standard registration flow', () => {
    component.currentTemp = 'account';
    component.showOrganizationStep = false;

    expect(component.isStepActive('info')).toBe(true);
    expect(component.isStepActive('account')).toBe(true);
    expect(component.isStepActive('sso')).toBe(false);
  });

  it('should mark organization active only in the custom organization flow', () => {
    component.currentTemp = 'organization';
    component.showOrganizationStep = true;

    expect(component.isStepActive('organization')).toBe(true);
    expect(component.isStepActive('account')).toBe(false);
  });
});
