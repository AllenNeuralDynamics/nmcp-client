import * as React from "react";

import {QueryPage} from "./QueryPage";
import {NdbConstants} from "../../models/constants";
import {SettingsDialogContainer} from "./SettingsDialog";
import {ApolloConsumer} from "@apollo/react-hooks";
import {SEARCH_NEURONS_QUERY} from "../../graphql/search";
import {ApolloError} from "apollo-client";
import {INeuron} from "../../models/neuron";
import {SearchScope, UIQueryPredicate, UIQueryPredicates} from "../../models/uiQueryPredicate";
import cuid from "cuid";
import {UserPreferences} from "../../util/userPreferences";

interface IContentProps {
    constants: NdbConstants;
    searchScope?: SearchScope;
    systemVersion?: string;
    exportLimit?: number;
}

interface IContentState {
    isSettingsOpen?: boolean;
    predicates?: UIQueryPredicate[];
    isInQuery?: boolean;
    queryError?: ApolloError;
    queryTime?: number;
    queryNonce?: string;
    totalCount?: number;
    neurons?: INeuron[];
    shouldAlwaysShowFullTracing?: boolean;
    shouldAlwaysShowSoma?: boolean;
}

export class Content extends React.Component<IContentProps, IContentState> {
    private _uiPredicates: UIQueryPredicates;

    private _queryPage: QueryPage;

    public constructor(props: IContentProps) {
        super(props);

        this.state = {
            isSettingsOpen: false,
            isInQuery: false,
            predicates: this.initializeQueryFilters(props),
            queryError: null,
            queryTime: -1,
            queryNonce: null,
            totalCount: NaN,
            neurons: [],
            shouldAlwaysShowFullTracing: UserPreferences.Instance.ShouldAlwaysShowFullTracing,
            shouldAlwaysShowSoma: UserPreferences.Instance.ShouldAlwaysShowSoma
        };
    }

    public componentWillReceiveProps(props: IContentProps) {
        this.setState({predicates: this.initializeQueryFilters(props)});
    }

    private initializeQueryFilters(props: IContentProps): UIQueryPredicate[] {
        if (!this.state) {
            this._uiPredicates = new UIQueryPredicates(UserPreferences.Instance.LastQuery, props.constants);

            this._uiPredicates.PredicateListener = () => this.setState({predicates: this._uiPredicates.Predicates});

            return this._uiPredicates.Predicates;
        } else {
            return this.state.predicates;
        }
    }

    private onResetPage = () => {
        this._uiPredicates.clearPredicates();

        this.setState({neurons: [], queryTime: -1});
    };

    private onSettingsClick() {
        this.setState({isSettingsOpen: true});
    }

    private onSettingsClose() {
        this.setState({isSettingsOpen: false});
    }

    private onExecuteQuery = async (client, nonce: string = null) => {
        this.setState({isInQuery: true});

        try {
            UserPreferences.Instance.AppendQueryHistory(this.state.predicates);

            const context = {
                nonce: nonce || cuid(),
                scope: this.props.searchScope,
                predicates: this.state.predicates.map(f => f.asFilterInput())
            };

            const {data, error} = await client.query({
                query: SEARCH_NEURONS_QUERY,
                variables: {context}
            });

            if (error) {
                this.setState({
                    isInQuery: false,
                    queryError: error,
                    queryNonce: null,
                    neurons: []
                });
                return;
            }

            this.setState({
                queryError: null,
                isInQuery: false,
                queryTime: data.searchNeurons.queryTime,
                queryNonce: data.searchNeurons.nonce,
                totalCount: data.searchNeurons.totalCount,
                neurons: data.searchNeurons.neurons,
                shouldAlwaysShowSoma: UserPreferences.Instance.ShouldAlwaysShowSoma,
                shouldAlwaysShowFullTracing: UserPreferences.Instance.ShouldAlwaysShowFullTracing
            });
        } catch (err) {
            console.log(err);
            this.setState({isInQuery: false});
        }
    };

    public render() {
        return (
            <ApolloConsumer>
                {client => (
                    <div style={{height: "calc(100vh - 94px)"}}>
                        <SettingsDialogContainer/>
                        <QueryPage constants={this.props.constants} predicates={this._uiPredicates}
                                   predicateList={this.state.predicates} neurons={this.state.neurons}
                                   totalCount={this.state.totalCount} isInQuery={this.state.isInQuery}
                                   queryError={this.state.queryError} queryTime={this.state.queryTime}
                                   queryNonce={this.state.queryNonce}
                                   shouldAlwaysShowFullTracing={this.state.shouldAlwaysShowFullTracing}
                                   shouldAlwaysShowSoma={this.state.shouldAlwaysShowSoma}
                                   isPublicRelease={this.props.searchScope >= SearchScope.Public}
                                   exportLimit={this.props.exportLimit}
                                   ref={(r) => this._queryPage = r}
                                   onPerformQuery={() => this.onExecuteQuery(client)}
                                   onResetPage={() => this.onResetPage()}/>
                    </div>
                )}
            </ApolloConsumer>
        );
    }
}
