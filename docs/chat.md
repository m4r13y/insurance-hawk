we need to adjust our functionality for storing medigap plans in Firestore. I can see that when there is existing data, and a new one runs, we overwrite the data. This is good for all other plan types. The issue is specifically with Medigap plans, becasue of this scenario:

If I run an initial Medigapp quote for one plan (ie. Plan G), it generates the quote and works great. But if I then click the Plan Type button to run a quote for another plan type(i.e. Plan N), the response is returned from the getMedigapQuotes function and replaces the data, causing me to loose the initial Plan G data. I want it to keep all data for the generated plan type quotes so I can compare them. However, If I decide to run another variation of the quote (i.e. change the age or gender), I would want it to overwrite the data. 

Do you understand my problem?

I think the proper solution is to add more distinct organization in the medigap_quotes collection. 

We need to consider that even though we send Plan Types grouped in one object to the function, the function executes them individually. I.e. if we send plan: ['F,''N'], the function executes plan F, then plan N. So we need to be able to determine which plan type is being returned (if we arent already).

We have a few options. 

1. add unique names for the chunks.
instead of medicare_real_quotes_chunk_#, we make it medicare_real_quotes_[planType]_chunk_#. 

2. create more layers, by adding a new document and new collection and new document. I.e. instead of /[visitor_id]/medigap_quotes/medicare_real_quotes_chunk_#, we make it /[visitor_id]/medigap_quotes/plans/[planType]/medicare_real_quotes_chunk_#

3. create new collection for each plan type. i.e. instead of /[visitor_id]/medigap_quotes/medicare_real_quotes_chunk_#, we make it /[visitor_id]/medigap_quotes_[planType]/medicare_real_quotes_chunk_#


Which do you think is the best option so we dont lose any existing functionality?