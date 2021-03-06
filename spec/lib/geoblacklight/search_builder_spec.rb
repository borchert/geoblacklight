require 'spec_helper'

describe Geoblacklight::SearchBuilder do
  let(:method_chain) { CatalogController.search_params_logic }
  let(:user_params) { Hash.new }
  let(:solr_params) { Hash.new }
  let(:context) { CatalogController.new }

  let(:search_builder) { described_class.new(method_chain, context) }

  subject { search_builder.with(user_params) }

  describe '#initialize' do
    it 'should have add_spatial_params in processor chain once' do
      correct_processor_chain = [:default_solr_parameters,
                                 :add_query_to_solr,
                                 :add_facet_fq_to_solr,
                                 :add_facetting_to_solr,
                                 :add_solr_fields_to_query,
                                 :add_paging_to_solr,
                                 :add_sorting_to_solr,
                                 :add_group_config_to_solr,
                                 :add_range_limit_params,
                                 :add_spatial_params]
      expect(subject.processor_chain).to include :add_spatial_params
      expect(subject.processor_chain).to match_array correct_processor_chain
      new_search = described_class.new(subject.processor_chain, context)
      expect(new_search.processor_chain).to include :add_spatial_params
      expect(new_search.processor_chain).to match_array correct_processor_chain
    end
  end

  describe '#add_spatial_params' do
    it 'should return the solr_params when no bbox is given' do
      expect(subject.add_spatial_params(solr_params)).to eq solr_params
    end

    it 'should return a spatial search if bbox is given' do
      params = { bbox: '-180 -80 120 80' }
      subject.with(params)
      expect(subject.add_spatial_params(solr_params)[:fq].to_s).to include('Intersects')
    end
  end
  describe '#envelope_bounds' do
    it 'calls to_envelope on the bounding box' do
      bbox = double('bbox', to_envelope: 'test')
      expect(subject).to receive(:bounding_box).and_return bbox
      expect(subject.envelope_bounds).to eq 'test'
    end
  end
  describe '#bounding_box' do
    it 'creates a bounding box from a Solr lat-lon rectangle format' do
      params = { bbox: '-120 -80 120 80' }
      subject.with(params)
      expect(subject.bounding_box).to be_an Geoblacklight::BoundingBox
    end
  end
end
