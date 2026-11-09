import gql from "graphql-tag";

export const QualityOutputCommonFieldsFragment = gql`fragment QualityOutputCommonFields on QualityOutput {
    serviceVersion
    toolVersion
    when
}`;

export const QualityOutputFieldsFragment = gql`fragment QualityOutputFields on QualityOutput {
    ...QualityOutputCommonFields
    data
}
${QualityOutputCommonFieldsFragment}
`;
