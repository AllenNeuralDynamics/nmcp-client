import * as React from "react";
import {ApolloError, } from "@apollo/client";
import {ApolloConsumer} from "@apollo/client";
import cuid from "cuid";

import {QueryPage, QueryPageRef} from "./QueryPage";
import {NdbConstants} from "../../models/constants";
import {SEARCH_NEURONS_QUERY, SearchContext} from "../../graphql/search";
import {INeuron} from "../../models/neuron";
import {UIQueryPredicate, UIQueryPredicates} from "../../models/uiQueryPredicate";
import {UserPreferences} from "../../util/userPreferences";
import {Footer} from "./Footer";
import {NeuroglancerProxy} from "../../viewer/neuroglancer/neuroglancer";

interface IContentProps {
    constants: NdbConstants;
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

    private readonly _queryPage: React.RefObject<QueryPageRef>;

    private _shouldAutoExecuteFromUrl: boolean = false;

    private parseUrlQuery(): UIQueryPredicate[] | null {
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get("q");
        const ngParam = window.location.hash;

        let predicates: UIQueryPredicate[] = [];

        if (ngParam) {
            try {
                const decodedState = JSON.parse(atob(ngParam.slice(2)));
                NeuroglancerProxy.applyQueryParameterState(decodedState);
            } catch (e) {
                console.warn("Invalid Neuroglancer query parameter:", e);
            }
        }

        if (queryParam) {
            try {
                const decodedQuery = JSON.parse(atob(queryParam));
                if (decodedQuery && decodedQuery.filters && Array.isArray(decodedQuery.filters)) {
                    predicates = decodedQuery.filters.map(f => UIQueryPredicate.deserialize(f, this.props.constants));
                }
            } catch (e) {
                console.warn("Invalid URL query parameter:", e);
            }
        }

        window.history.replaceState({}, document.title, "/");

        return predicates;
    }

    private updateUrlWithQuery = (predicates: UIQueryPredicate[]) => {
        const queryData = {
            timestamp: Date.now(),
            filters: predicates.map(p => p.serialize())
        };
        
        const encodedQuery = btoa(JSON.stringify(queryData));
        const url = new URL(window.location.href);
        url.searchParams.set("q", encodedQuery);
        
        window.history.replaceState({}, "", url.toString());
    };

    public constructor(props: IContentProps) {
        super(props);

        this._queryPage = React.createRef<QueryPageRef>();

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

    public componentDidMount() {
        if (this._shouldAutoExecuteFromUrl) {
            this._shouldAutoExecuteFromUrl = false;
        }
    }

    public componentWillReceiveProps(props: IContentProps) {
        this.setState({predicates: this.initializeQueryFilters(props)});
    }

    private initializeQueryFilters(props: IContentProps): UIQueryPredicate[] {
        if (!this.state) {
            const urlQuery = this.parseUrlQuery();
            if (urlQuery && urlQuery.length > 0) {
                this._shouldAutoExecuteFromUrl = true;
                this._uiPredicates = new UIQueryPredicates(urlQuery, null, props.constants);
            } else {
                this._uiPredicates = new UIQueryPredicates(null, UserPreferences.Instance.LastQuery, props.constants);
            }

            this._uiPredicates.PredicateListener = () => {
                this.setState({predicates: this._uiPredicates.Predicates});
                // TODO Not well tested to continuously update the URL with the query.
                // this.updateUrlWithQuery(this._uiPredicates.Predicates);
            };

            return this._uiPredicates.Predicates;
        } else {
            return this.state.predicates;
        }
    }

    private onResetPage = () => {
        this._uiPredicates.clearPredicates();

        const url = new URL(window.location.href);
        url.searchParams.delete("q");
        window.history.replaceState({}, "", url.toString());

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

            const context: SearchContext = {
                nonce: nonce || cuid(),
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
                {client => {
                    if (this._shouldAutoExecuteFromUrl) {
                        this._shouldAutoExecuteFromUrl = false;
                        setTimeout(() => {
                            this.onExecuteQuery(client, cuid());
                        }, 100);
                    }
                    
                    return (
                        <div style={{height: "calc(100vh - 94px)"}}>
                            <QueryPage constants={this.props.constants} predicates={this._uiPredicates}
                                       predicateList={this.state.predicates} neurons={this.state.neurons}
                                       totalCount={this.state.totalCount} isInQuery={this.state.isInQuery}
                                       queryError={this.state.queryError} queryTime={this.state.queryTime}
                                       queryNonce={this.state.queryNonce}
                                       shouldAlwaysShowFullTracing={this.state.shouldAlwaysShowFullTracing}
                                       shouldAlwaysShowSoma={this.state.shouldAlwaysShowSoma}
                                       exportLimit={this.props.exportLimit}
                                       ref={this._queryPage}
                                       onPerformQuery={() => this.onExecuteQuery(client)}
                                       onResetPage={() => this.onResetPage()}/>
                            <Footer/>
                        </div>
                    );
                }}
            </ApolloConsumer>
        );
    }
}
