/* tslint:disable */
/* eslint-disable */
/**
 * Pathos
 * Pathos의 API 명세서입니다.
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { CellDetail } from './CellDetail';
import {
    CellDetailFromJSON,
    CellDetailFromJSONTyped,
    CellDetailToJSON,
    CellDetailToJSONTyped,
} from './CellDetail';
import type { RoiRequestDto } from './RoiRequestDto';
import {
    RoiRequestDtoFromJSON,
    RoiRequestDtoFromJSONTyped,
    RoiRequestDtoToJSON,
    RoiRequestDtoToJSONTyped,
} from './RoiRequestDto';

/**
 * 학습 결과 ROI 정보 리스트
 * @export
 * @interface RoiRequestPayload
 */
export interface RoiRequestPayload {
    /**
     * 화면에 표시될 ROI 순서
     * @type {number}
     * @memberof RoiRequestPayload
     */
    displayOrder?: number;
    /**
     * 
     * @type {RoiRequestDto}
     * @memberof RoiRequestPayload
     */
    detail?: RoiRequestDto;
    /**
     * 조직 이미지 경로 리스트
     * @type {Array<string>}
     * @memberof RoiRequestPayload
     */
    tissuePath?: Array<string>;
    /**
     * 세포 좌표 리스트
     * @type {Array<CellDetail>}
     * @memberof RoiRequestPayload
     */
    cell?: Array<CellDetail>;
}

/**
 * Check if a given object implements the RoiRequestPayload interface.
 */
export function instanceOfRoiRequestPayload(value: object): value is RoiRequestPayload {
    return true;
}

export function RoiRequestPayloadFromJSON(json: any): RoiRequestPayload {
    return RoiRequestPayloadFromJSONTyped(json, false);
}

export function RoiRequestPayloadFromJSONTyped(json: any, ignoreDiscriminator: boolean): RoiRequestPayload {
    if (json == null) {
        return json;
    }
    return {
        
        'displayOrder': json['displayOrder'] == null ? undefined : json['displayOrder'],
        'detail': json['detail'] == null ? undefined : RoiRequestDtoFromJSON(json['detail']),
        'tissuePath': json['tissue_path'] == null ? undefined : json['tissue_path'],
        'cell': json['cell'] == null ? undefined : ((json['cell'] as Array<any>).map(CellDetailFromJSON)),
    };
}

export function RoiRequestPayloadToJSON(json: any): RoiRequestPayload {
    return RoiRequestPayloadToJSONTyped(json, false);
}

export function RoiRequestPayloadToJSONTyped(value?: RoiRequestPayload | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'displayOrder': value['displayOrder'],
        'detail': RoiRequestDtoToJSON(value['detail']),
        'tissue_path': value['tissuePath'],
        'cell': value['cell'] == null ? undefined : ((value['cell'] as Array<any>).map(CellDetailToJSON)),
    };
}

