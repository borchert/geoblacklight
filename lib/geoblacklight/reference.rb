module Geoblacklight
  ##
  # Parses an array of dct_references to create useful reference information
  class Reference
    attr_reader :reference

    ##
    # Initializes a Reference object using an Array
    # @param [Array] reference
    def initialize(reference)
      @reference = reference
    end

    ##
    # The endpoint URL for a Geoblacklight::Reference
    # @return [String]
    def endpoint
      @reference[1]
    end

    ##
    # Lookups the type from the Constants::URI using the reference's URI
    # @return [Symbol]
    def type
      Geoblacklight::Constants::URI.key(base_uri)
    end

    ##
    # Creates a hash, using its type as key and endpoint as value
    # @return [Hash]
    def to_hash
      { type => endpoint }
    end

    ##
    # The URI used for this instance's creation
    # @return [String]
    def uri
      @reference[0]
    end

    private

    ##
    # The URI without fragment (#...)
    # @return [String]
    def base_uri
      uri.sub(/#(.+)/,'')
    end

  end
end
