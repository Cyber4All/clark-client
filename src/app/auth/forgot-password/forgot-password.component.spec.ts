import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UntypedFormControl } from "@angular/forms";
import { of, throwError } from "rxjs";

import { ForgotPasswordComponent } from "./forgot-password.component";
import { AuthService } from "app/core/auth-module/auth.service";
import { AuthValidationService } from "app/core/auth-module/auth-validation.service";

describe("ForgotPasswordComponent", () => {
    let component: ForgotPasswordComponent;
    let fixture: ComponentFixture<ForgotPasswordComponent>;
    let authService: {
        emailInUse: jest.Mock;
        initiateResetPassword: jest.Mock;
    };
    let authValidationService: {
        getInputFormControl: jest.Mock;
        getErrorState: jest.Mock;
        showError: jest.Mock;
    };

    const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

    beforeEach(async () => {
        authService = {
            emailInUse: jest
                .fn()
                .mockResolvedValue({ identifierInUse: false }),
            initiateResetPassword: jest.fn().mockReturnValue(of("ok")),
        };
        authValidationService = {
            getInputFormControl: jest
                .fn()
                .mockImplementation(() => new UntypedFormControl("")),
            getErrorState: jest.fn().mockReturnValue(of(false)),
            showError: jest.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [ForgotPasswordComponent],
            providers: [
                { provide: AuthService, useValue: authService },
                {
                    provide: AuthValidationService,
                    useValue: authValidationService,
                },
            ],
        })
            .overrideComponent(ForgotPasswordComponent, {
                set: { template: "", imports: [] },
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ForgotPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.emails.setValue({
            email: "user@example.com",
            confirmEmail: "user@example.com",
        });
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    describe("email validation errors", () => {
        it("does not throw when the request fails with a ProgressEvent", async () => {
            const progressEvent =
                typeof ProgressEvent !== "undefined"
                    ? new ProgressEvent("error")
                    : { type: "error" };
            authService.emailInUse.mockRejectedValue(progressEvent);

            component.submit();
            await flushPromises();

            expect(authValidationService.showError).toHaveBeenCalled();
            expect(component.errorMessage).toBe(
                "Something went wrong. Please try again later.",
            );
        });

        it("uses the message from a JSON string error", async () => {
            authService.emailInUse.mockRejectedValue(
                JSON.stringify({ message: "Invalid email" }),
            );

            component.submit();
            await flushPromises();

            expect(authValidationService.showError).toHaveBeenCalled();
            expect(component.errorMessage).toBe("Invalid email");
        });

        it("uses the message from an object error", async () => {
            authService.emailInUse.mockRejectedValue({
                message: "Server unavailable",
            });

            component.submit();
            await flushPromises();

            expect(component.errorMessage).toBe("Server unavailable");
        });
    });

    describe("reset password errors", () => {
                throwError(JSON.stringify({ message: "Unknown user" })),
            authService.initiateResetPassword.mockReturnValue(
                throwError(() => JSON.stringify({ message: "Unknown user" })),
            );

            component.submit();

            expect(authValidationService.showError).toHaveBeenCalled();
            expect(component.errorMessage).toBe("Unknown user");
        });

                throwError("Too many requests"),
            authService.initiateResetPassword.mockReturnValue(
                throwError(() => "Too many requests"),
            );

            component.submit();

            expect(component.errorMessage).toBe("Too many requests");
        });

                throwError({ type: "error" }),
            authService.initiateResetPassword.mockReturnValue(
                throwError(() => ({ type: "error" })),
            );

            expect(() => component.submit()).not.toThrow();
            expect(component.errorMessage).toBe(
                "Something went wrong. Please try again later.",
            );
        });
    });
});
