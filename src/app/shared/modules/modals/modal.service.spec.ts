import { TestBed, inject } from '@angular/core/testing';
import { ModalService } from './modal.service';
import { ModalListElement } from './modal-list-element';
import { Position } from './position';

describe('ModalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    providers: [ModalService],
    teardown: { destroyAfterEach: false }
});
  });

  it('should be created', inject([ModalService], (service: ModalService) => {
    expect(service).toBeTruthy();
  }));
  it('should create dialog menu', inject([ModalService], (service: ModalService) => {
    const result = service.makeDialogMenu('name', 'title', 'text');
    expect(result).toBeDefined();
  }));
  it('should create context menu', inject([ModalService], (service: ModalService) => {
    const element = new ModalListElement('name', 'function');
    const position = new Position(5, 5);
    const result = service.makeContextMenu('name', 'class', [element], true, null, position);
    expect(result).toBeDefined();
  }));
  it('should close context menu', inject([ModalService], (service: ModalService) => {
    service.close('context');
    expect(service.contextMenuContent).toEqual({});
  }));
  it('should close context menu', inject([ModalService], (service: ModalService) => {
    service.closeContextMenu();
    expect(service.contextMenuContent).toEqual({});
  }));
  it('should close dialog menu', inject([ModalService], (service: ModalService) => {
    service.close('dialog');
    expect(service.dialogMenuContent).toEqual({});
  }));
  it('should close dialog menu', inject([ModalService], (service: ModalService) => {
    service.closeDialogMenu();
    expect(service.dialogMenuContent).toEqual({});
  }));
  it('should close context and  dialog menu', inject([ModalService], (service: ModalService) => {
    service.closeAll();
    expect(service.dialogMenuContent).toEqual({});
    expect(service.contextMenuContent).toEqual({});
  }));
});
