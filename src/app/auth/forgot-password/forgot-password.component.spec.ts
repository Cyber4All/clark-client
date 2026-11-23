import { AuthValidationService } from "../../core/auth-module/auth-validation.service";
import { of } from "rxjs";
import { ForgotPasswordComponent } from "./forgot-password.component";

describe("ForgotPasswordComponent", () => {
    let component: ForgotPasswordComponent;
    let authService: {
        emailInUse: jest.Mock;
        initiateResetPassword: jest.Mock;
    };

    beforeEach(() => {
        authService = {
            emailInUse: jest.fn(),
            initiateResetPassword: jest.fn(() => of("")),
        };

        component = new ForgotPasswordComponent(
            new AuthValidationService(),
            authService as any,
        );
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should submit matching, valid emails without checking whether the email is in use", () => {
        component.emails.setValue({
            email: "learner@example.com",
            confirmEmail: "learner@example.com",
        });

        component.submit();

        expect(authService.emailInUse).not.toHaveBeenCalled();
        expect(authService.initiateResetPassword).toHaveBeenCalledWith(
            "learner@example.com",
        );
        expect(component.showDone).toBe(true);
    });

    it("should not submit an invalid email format", () => {
        component.emails.setValue({
            email: "not-an-email",
            confirmEmail: "not-an-email",
        });

        component.submit();

        expect(component.emails.controls.email.hasError("email")).toBe(true);
        expect(authService.initiateResetPassword).not.toHaveBeenCalled();
    });

    it("should not submit emails that do not match", () => {
        component.emails.setValue({
            email: "learner@example.com",
            confirmEmail: "different@example.com",
        });

        component.submit();

        expect(
            component.emails.controls.confirmEmail.hasError("mustMatch"),
        ).toBe(true);
        expect(authService.initiateResetPassword).not.toHaveBeenCalled();
    });
});
